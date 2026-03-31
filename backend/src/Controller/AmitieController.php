<?php

namespace App\Controller;

use App\Entity\Amitie;
use App\Entity\User;
use App\Entity\Notification;
use App\Repository\AmitieRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/amis')]
#[IsGranted('ROLE_USER')]
class AmitieController extends AbstractController
{
    public function __construct(
        private AmitieRepository $amitieRepository,
        private UserRepository $userRepository,
        private EntityManagerInterface $em
    ) {
    }

    #[Route('', methods: ['GET'])]
    public function getFriends(): JsonResponse
    {
        $user = $this->getUser();
        $amitiess = $this->amitieRepository->findFriends($user);
        
        $friends = [];
        foreach ($amitiess as $amitie) {
            $friend = $amitie->getUser1()->getId() === $user->getId() 
                ? $amitie->getUser2() 
                : $amitie->getUser1();
            
            $friends[] = [
                'id' => $friend->getId(),
                'prenom' => $friend->getPrenom(),
                'nom' => $friend->getNom(),
                'email' => $friend->getEmail(),
                'photo' => $friend->getPhoto(),
                'universite' => $friend->getUniversite(),
            ];
        }
        
        return $this->json($friends);
    }

    #[Route('/demandes', methods: ['GET'])]
    public function getPendingRequests(): JsonResponse
    {
        $user = $this->getUser();
        $requests = $this->amitieRepository->findPendingRequests($user);
        
        $data = [];
        foreach ($requests as $amitie) {
            $data[] = [
                'id' => $amitie->getId(),
                'from' => [
                    'id' => $amitie->getUser1()->getId(),
                    'prenom' => $amitie->getUser1()->getPrenom(),
                    'nom' => $amitie->getUser1()->getNom(),
                    'email' => $amitie->getUser1()->getEmail(),
                    'photo' => $amitie->getUser1()->getPhoto(),
                ],
                'createdAt' => $amitie->getCreatedAt()?->format('c'),
            ];
        }
        
        return $this->json($data);
    }

    #[Route('/suggestions', methods: ['GET'])]
    public function getSuggestions(): JsonResponse
    {
        $user = $this->getUser();
        $suggestions = $this->amitieRepository->findSuggestions($user, 10);
        
        $data = [];
        foreach ($suggestions as $suggestedUser) {
            $data[] = [
                'id' => $suggestedUser->getId(),
                'prenom' => $suggestedUser->getPrenom(),
                'nom' => $suggestedUser->getNom(),
                'email' => $suggestedUser->getEmail(),
                'photo' => $suggestedUser->getPhoto(),
                'universite' => $suggestedUser->getUniversite(),
            ];
        }
        
        return $this->json($data);
    }

    #[Route('/sent', methods: ['GET'])]
    public function getSentRequests(): JsonResponse
    {
        $user = $this->getUser();
        $requests = $this->amitieRepository->findSentRequests($user);
        
        $data = [];
        foreach ($requests as $amitie) {
            $data[] = [
                'id' => $amitie->getId(),
                'to' => [
                    'id' => $amitie->getUser2()->getId(),
                    'prenom' => $amitie->getUser2()->getPrenom(),
                    'nom' => $amitie->getUser2()->getNom(),
                    'email' => $amitie->getUser2()->getEmail(),
                    'photo' => $amitie->getUser2()->getPhoto(),
                ],
                'createdAt' => $amitie->getCreatedAt()?->format('c'),
            ];
        }
        
        return $this->json($data);
    }

    #[Route('/send/{userId}', methods: ['POST'])]
    public function sendFriendRequest(int $userId): JsonResponse
    {
        $user = $this->getUser();
        $recipient = $this->userRepository->find($userId);
        
        if (!$recipient) {
            return $this->json(['error' => 'Utilisateur non trouvé'], 404);
        }
        
        if ($recipient->getId() === $user->getId()) {
            return $this->json(['error' => 'Vous ne pouvez pas vous ajouter en ami'], 400);
        }
        
        $existing = $this->amitieRepository->findFriendship($user, $recipient);
        if ($existing) {
            return $this->json(['error' => 'Relation déjà existante'], 400);
        }
        
        $amitie = new Amitie();
        $amitie->setUser1($user);
        $amitie->setUser2($recipient);
        $amitie->setStatut('pending');
        
        $this->em->persist($amitie);

        // Create notification for recipient
        $notification = new Notification();
        $notification->setUtilisateur($recipient);
        $notification->setType('friend_request');
        $notification->setAuteur($user);
        $notification->setContenu('vous a envoyé une demande d\'amitié');
        $notification->setRelatedId($amitie->getId());
        $notification->setRelatedType('amitie');
        $notification->setLue(false);
        $this->em->persist($notification);

        $this->em->flush();
        
        return $this->json([
            'id' => $amitie->getId(),
            'statut' => 'pending',
            'createdAt' => $amitie->getCreatedAt()?->format('c'),
        ]);
    }

    #[Route('/{amitieId}/accept', methods: ['PATCH'])]
    public function acceptRequest(int $amitieId): JsonResponse
    {
        $user = $this->getUser();
        $amitie = $this->amitieRepository->find($amitieId);
        
        if (!$amitie) {
            return $this->json(['error' => 'Demande non trouvée'], 404);
        }
        
        if ($amitie->getUser2()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Vous ne pouvez pas accepter cette demande'], 403);
        }
        
        $amitie->setStatut('accepted');
        $amitie->setUpdatedAt(new \DateTimeImmutable());
        
        // Create notification for the user who sent the request
        $notification = new Notification();
        $notification->setUtilisateur($amitie->getUser1());
        $notification->setType('friend_request');
        $notification->setAuteur($user);
        $notification->setContenu('a accepté votre demande d\'amitié');
        $notification->setRelatedId($amitie->getId());
        $notification->setRelatedType('amitie');
        $notification->setLue(false);
        $this->em->persist($notification);

        $this->em->flush();
        
        return $this->json([
            'id' => $amitie->getId(),
            'statut' => 'accepted',
            'updatedAt' => $amitie->getUpdatedAt()?->format('c'),
        ]);
    }

    #[Route('/{amitieId}/reject', methods: ['PATCH'])]
    public function rejectRequest(int $amitieId): JsonResponse
    {
        $user = $this->getUser();
        $amitie = $this->amitieRepository->find($amitieId);
        
        if (!$amitie) {
            return $this->json(['error' => 'Demande non trouvée'], 404);
        }
        
        if ($amitie->getUser2()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Vous ne pouvez pas refuser cette demande'], 403);
        }
        
        $amitie->setStatut('rejected');
        $amitie->setUpdatedAt(new \DateTimeImmutable());
        
        // Create notification for the user who sent the request
        $notification = new Notification();
        $notification->setUtilisateur($amitie->getUser1());
        $notification->setType('friend_request');
        $notification->setAuteur($user);
        $notification->setContenu('a refusé votre demande d\'amitié');
        $notification->setRelatedId($amitie->getId());
        $notification->setRelatedType('amitie');
        $notification->setLue(false);
        $this->em->persist($notification);

        $this->em->flush();
        
        return $this->json([
            'id' => $amitie->getId(),
            'statut' => 'rejected',
            'updatedAt' => $amitie->getUpdatedAt()?->format('c'),
        ]);
    }

    #[Route('/{userId}', methods: ['DELETE'])]
    public function removeFriend(int $userId): JsonResponse
    {
        $user = $this->getUser();
        $friend = $this->userRepository->find($userId);
        
        if (!$friend) {
            return $this->json(['error' => 'Utilisateur non trouvé'], 404);
        }
        
        $amitie = $this->amitieRepository->findFriendship($user, $friend);
        
        if (!$amitie || $amitie->getStatut() !== 'accepted') {
            return $this->json(['error' => 'Amitié non trouvée'], 404);
        }
        
        $this->em->remove($amitie);
        $this->em->flush();
        
        return $this->json(['success' => true]);
    }

    #[Route('/status/{userId}', methods: ['GET'])]
    public function getRelationshipStatus(int $userId): JsonResponse
    {
        $user = $this->getUser();
        $otherUser = $this->userRepository->find($userId);
        
        if (!$otherUser) {
            return $this->json(['error' => 'Utilisateur non trouvé'], 404);
        }
        
        if ($otherUser->getId() === $user->getId()) {
            return $this->json(['statut' => 'self']);
        }
        
        $amitie = $this->amitieRepository->findFriendship($user, $otherUser);
        
        if (!$amitie) {
            return $this->json(['statut' => 'none']);
        }
        
        $status = $amitie->getStatut();
        
        if ($status === 'accepted') {
            return $this->json(['statut' => 'friend']);
        }
        
        if ($status === 'pending') {
            if ($amitie->getUser1()->getId() === $user->getId()) {
                return $this->json(['statut' => 'pending_sent']);
            } else {
                return $this->json(['statut' => 'pending_received', 'amitieId' => $amitie->getId()]);
            }
        }
        
        return $this->json(['statut' => $status]);
    }
}
