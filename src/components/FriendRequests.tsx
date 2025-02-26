'use client';

import axios from 'axios';
import { Check, UserPlus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { pusherClient } from '../lib/pusher';
import { toPusherKey } from '../lib/utils';

interface FriendRequestsProps {
  // eslint-disable-next-line no-undef
  incomingFriendRequests: IncomingFriendRequest[];
  sessionId: string;
}

export default function FriendRequests({
  incomingFriendRequests,
  sessionId,
}: FriendRequestsProps) {
  const router = useRouter();
  // eslint-disable-next-line no-undef
  const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(
    incomingFriendRequests,
  );

  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`user:${sessionId}:incoming_friend_requests`),
    );

    function friendRequestHandler({
      senderId,
      senderEmail,
      // eslint-disable-next-line no-undef
    }: IncomingFriendRequest) {
      setFriendRequests((prev) => [...prev, { senderId, senderEmail }]);
    }

    pusherClient.bind('incoming_friend_requests', friendRequestHandler);

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${sessionId}:incoming_friend_requests`),
      );
      pusherClient.unbind('incoming_friend_requests', friendRequestHandler);
    };
  }, [sessionId]);

  async function acceptFriend(senderId: string) {
    await axios.post('/api/friends/accept', { id: senderId });
    setFriendRequests((prev) =>
      prev.filter((request) => request.senderId !== senderId),
    );
    router.refresh();
  }

  async function denyFriend(senderId: string) {
    await axios.post('/api/friends/deny', { id: senderId });
    setFriendRequests((prev) =>
      prev.filter((request) => request.senderId !== senderId),
    );
    router.refresh();
  }

  return (
    <div>
      {friendRequests.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing to show here...</p>
      ) : (
        friendRequests.map((request) => (
          <div
            key={`request-${request.senderId}`}
            className="flex gap-4 items-center"
          >
            <UserPlus className="text-black" />
            <p className="font-medium text-lg">{request.senderEmail}</p>
            <button
              onClick={() => acceptFriend(request.senderId)}
              aria-label="accept friend"
              className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md"
            >
              <Check className="font-semibold text-white w-3/4 h-3/4" />
            </button>

            <button
              onClick={() => denyFriend(request.senderId)}
              aria-label="deny friend"
              className="w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md"
            >
              <X className="font-semibold text-white w-3/4 h-3/4" />
            </button>
          </div>
        ))
      )}
    </div>
  );
}
