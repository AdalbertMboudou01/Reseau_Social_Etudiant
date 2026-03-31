<?php

namespace App\Controller;

use App\Repository\NotificationRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/notifications')]
#[IsGranted('ROLE_USER')]
class NotificationController extends AbstractController
{
    public function __construct(private NotificationRepository $notificationRepository)
    {
    }

    #[Route('', methods: ['GET'])]
    public function getNotifications(): JsonResponse
    {
        $user = $this->getUser();
        $notifications = $this->notificationRepository->findByUtilisateur($user, 50);

        $data = [];
        foreach ($notifications as $notification) {
            $data[] = [
                'id' => $notification->getId(),
                'type' => $notification->getType(),
                'auteur' => $notification->getAuteur() ? [
                    'id' => $notification->getAuteur()->getId(),
                    'prenom' => $notification->getAuteur()->getPrenom(),
                    'nom' => $notification->getAuteur()->getNom(),
                    'photo' => $notification->getAuteur()->getPhoto(),
                ] : null,
                'contenu' => $notification->getContenu(),
                'relatedId' => $notification->getRelatedId(),
                'relatedType' => $notification->getRelatedType(),
                'lue' => $notification->isLue(),
                'createdAt' => $notification->getCreatedAt()?->format('c'),
            ];
        }

        return $this->json($data);
    }

    #[Route('/unread/count', methods: ['GET'])]
    public function getUnreadCount(): JsonResponse
    {
        $user = $this->getUser();
        $count = $this->notificationRepository->countUnread($user);
        return $this->json(['count' => $count]);
    }

    #[Route('/unread', methods: ['GET'])]
    public function getUnread(): JsonResponse
    {
        $user = $this->getUser();
        $notifications = $this->notificationRepository->findUnread($user, 20);

        $data = [];
        foreach ($notifications as $notification) {
            $data[] = [
                'id' => $notification->getId(),
                'type' => $notification->getType(),
                'auteur' => $notification->getAuteur() ? [
                    'id' => $notification->getAuteur()->getId(),
                    'prenom' => $notification->getAuteur()->getPrenom(),
                    'nom' => $notification->getAuteur()->getNom(),
                    'photo' => $notification->getAuteur()->getPhoto(),
                ] : null,
                'contenu' => $notification->getContenu(),
                'relatedId' => $notification->getRelatedId(),
                'relatedType' => $notification->getRelatedType(),
                'createdAt' => $notification->getCreatedAt()?->format('c'),
            ];
        }

        return $this->json($data);
    }

    #[Route('/{id}/read', methods: ['PATCH'])]
    public function markAsRead(int $id): JsonResponse
    {
        $user = $this->getUser();
        $notification = $this->notificationRepository->find($id);

        if (!$notification) {
            return $this->json(['error' => 'Notification non trouvée'], 404);
        }

        if ($notification->getUtilisateur()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Accès refusé'], 403);
        }

        $this->notificationRepository->markAsRead($notification);

        return $this->json(['success' => true]);
    }

    #[Route('/read-all', methods: ['PATCH'])]
    public function markAllAsRead(): JsonResponse
    {
        $user = $this->getUser();
        $this->notificationRepository->markAllAsRead($user);

        return $this->json(['success' => true]);
    }
}
