<?php

namespace App\Controller;

use App\Entity\MessagePrive;
use App\Entity\User;
use App\Entity\Notification;
use App\Repository\MessagePriveRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/messages')]
class MessagePriveController extends AbstractController
{
    /**
     * GET /api/messages - Liste les conversations de l'utilisateur
     */
    #[Route('', name: 'api_messages_list', methods: ['GET'])]
    public function listConversations(MessagePriveRepository $messageRepo): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $messages = $messageRepo->findConversationsForUser($user);
        
        // Grouper par interlocuteur et récupérer le dernier message
        $conversations = [];
        $interlocuteurs = [];

        foreach ($messages as $message) {
            $interlocuteur = $message->getExpediteur()->getId() === $user->getId()
                ? $message->getDestinataire()
                : $message->getExpediteur();

            $interlocuteurId = $interlocuteur->getId();
            if (!isset($interlocuteurs[$interlocuteurId])) {
                $interlocuteurs[$interlocuteurId] = $interlocuteur;
            }
        }

        foreach ($interlocuteurs as $interlocuteur) {
            $conversations[] = [
                'id' => $interlocuteur->getId(),
                'nom' => $interlocuteur->getNom(),
                'prenom' => $interlocuteur->getPrenom(),
                'email' => $interlocuteur->getEmail(),
                'photo' => $interlocuteur->getPhoto(),
            ];
        }

        return $this->json($conversations);
    }

    /**
     * GET /api/messages/{userId} - Récupère une conversation avec un utilisateur
     */
    #[Route('/{userId}', name: 'api_messages_show', methods: ['GET'])]
    public function showConversation(
        int $userId,
        UserRepository $userRepo,
        MessagePriveRepository $messageRepo
    ): JsonResponse {
        /** @var User $currentUser */
        $currentUser = $this->getUser();

        $otherUser = $userRepo->find($userId);
        if (!$otherUser) {
            return $this->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        $messages = $messageRepo->findConversation($currentUser, $otherUser);

        // Marquer les messages comme lus
        $messageRepo->markAsRead($otherUser, $currentUser);

        $data = array_map(fn(MessagePrive $m) => [
            'id' => $m->getId(),
            'contenu' => $m->getContenu(),
            'createdAt' => $m->getCreatedAt()?->format('Y-m-d H:i:s'),
            'expediteur' => [
                'id' => $m->getExpediteur()->getId(),
                'nom' => $m->getExpediteur()->getNom(),
                'prenom' => $m->getExpediteur()->getPrenom(),
                'photo' => $m->getExpediteur()->getPhoto(),
            ],
            'luParDestinataire' => $m->isLuParDestinataire(),
        ], $messages);

        return $this->json([
            'interlocuteur' => [
                'id' => $otherUser->getId(),
                'nom' => $otherUser->getNom(),
                'prenom' => $otherUser->getPrenom(),
                'email' => $otherUser->getEmail(),
                'photo' => $otherUser->getPhoto(),
            ],
            'messages' => $data,
        ]);
    }

    /**
     * POST /api/messages/{userId} - Envoie un message à un utilisateur
     */
    #[Route('/{userId}', name: 'api_messages_send', methods: ['POST'])]
    public function sendMessage(
        int $userId,
        Request $request,
        UserRepository $userRepo,
        EntityManagerInterface $em,
        ValidatorInterface $validator
    ): JsonResponse {
        /** @var User $currentUser */
        $currentUser = $this->getUser();

        $otherUser = $userRepo->find($userId);
        if (!$otherUser) {
            return $this->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['contenu']) || empty(trim($data['contenu']))) {
            return $this->json(['error' => 'Le contenu du message est requis'], 400);
        }

        $message = new MessagePrive();
        $message->setContenu($data['contenu']);
        $message->setExpediteur($currentUser);
        $message->setDestinataire($otherUser);

        $errors = $validator->validate($message);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[$error->getPropertyPath()] = $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], 400);
        }

        $em->persist($message);

        // Create notification for recipient
        $notification = new Notification();
        $notification->setUtilisateur($otherUser);
        $notification->setType('message');
        $notification->setAuteur($currentUser);
        $notification->setContenu('vous a envoyé un message');
        $notification->setRelatedId($message->getId());
        $notification->setRelatedType('message');
        $notification->setLue(false);
        $em->persist($notification);

        $em->flush();

        return $this->json([
            'id' => $message->getId(),
            'contenu' => $message->getContenu(),
            'createdAt' => $message->getCreatedAt()?->format('Y-m-d H:i:s'),
            'expediteur' => [
                'id' => $currentUser->getId(),
                'nom' => $currentUser->getNom(),
                'prenom' => $currentUser->getPrenom(),
                'photo' => $currentUser->getPhoto(),
            ],
        ], 201);
    }

    /**
     * GET /api/messages/unread/count - Compte les messages non lus
     */
    #[Route('/unread/count', name: 'api_messages_unread_count', methods: ['GET'])]
    public function getUnreadCount(MessagePriveRepository $messageRepo): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $count = $messageRepo->countUnreadMessages($user);

        return $this->json(['count' => $count]);
    }
}
