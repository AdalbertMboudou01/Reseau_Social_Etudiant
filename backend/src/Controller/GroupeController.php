<?php

namespace App\Controller;

use App\Entity\Groupe;
use App\Entity\MembreGroupe;
use App\Entity\User;
use App\Entity\MessageGroupe;
use App\Repository\GroupeRepository;
use App\Repository\MembreGroupeRepository;
use App\Repository\MessageGroupeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/groupes')]
class GroupeController extends AbstractController
{
    #[Route('', name: 'api_groupes_list', methods: ['GET'])]
    public function index(GroupeRepository $repo): JsonResponse
    {
        $groupes = $repo->findAll();

        $data = array_map(fn(Groupe $g) => [
            'id' => $g->getId(),
            'nom' => $g->getNom(),
            'description' => $g->getDescription(),
            'membresCount' => $g->getMembresCount(),
            'membres' => array_map(fn(MembreGroupe $mg) => [
                'id' => $mg->getEtudiant()->getId(),
                'nom' => $mg->getEtudiant()->getNom(),
                'prenom' => $mg->getEtudiant()->getPrenom(),
                'photo' => $mg->getEtudiant()->getPhoto(),
                'dateAdhesion' => $mg->getDateAdhesion()?->format('Y-m-d H:i:s'),
            ], $g->getMembreGroupes()->toArray()),
            'createur' => [
                'id' => $g->getCreateur()->getId(),
                'nom' => $g->getCreateur()->getNom(),
                'prenom' => $g->getCreateur()->getPrenom(),
            ],
            'createdAt' => $g->getCreatedAt()?->format('Y-m-d H:i:s'),
        ], $groupes);

        return $this->json($data);
    }

    #[Route('/{id}/messages', name: 'api_groupes_messages', methods: ['GET'])]
    public function getMessages(
        Groupe $groupe,
        MessageGroupeRepository $messageRepo
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        // Vérifier que l'utilisateur est membre du groupe
        $isMember = $groupe->getMembreGroupes()->exists(
            fn($key, MembreGroupe $mg) => $mg->getEtudiant()->getId() === $user->getId()
        );

        if (!$isMember && $groupe->getCreateur()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Accès non autorisé'], 403);
        }

        $messages = $messageRepo->findByGroupeOrderedByDate($groupe->getId());

        $data = array_map(fn(MessageGroupe $m) => [
            'id' => $m->getId(),
            'contenu' => $m->getContenu(),
            'createdAt' => $m->getCreatedAt()?->format('Y-m-d H:i:s'),
            'auteur' => [
                'id' => $m->getAuteur()->getId(),
                'nom' => $m->getAuteur()->getNom(),
                'prenom' => $m->getAuteur()->getPrenom(),
                'photo' => $m->getAuteur()->getPhoto(),
            ],
        ], $messages);

        return $this->json($data);
    }

    #[Route('/{id}/messages', name: 'api_groupes_send_message', methods: ['POST'])]
    public function sendMessage(
        Groupe $groupe,
        Request $request,
        EntityManagerInterface $em,
        ValidatorInterface $validator
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        // Vérifier que l'utilisateur est membre du groupe
        $isMember = $groupe->getMembreGroupes()->exists(
            fn($key, MembreGroupe $mg) => $mg->getEtudiant()->getId() === $user->getId()
        );

        if (!$isMember && $groupe->getCreateur()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Vous devez être membre du groupe pour envoyer des messages'], 403);
        }

        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['contenu']) || empty(trim($data['contenu']))) {
            return $this->json(['error' => 'Le contenu du message est requis'], 400);
        }

        $message = new MessageGroupe();
        $message->setContenu(trim($data['contenu']));
        $message->setAuteur($user);
        $message->setGroupe($groupe);

        $errors = $validator->validate($message);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[$error->getPropertyPath()] = $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], 400);
        }

        $em->persist($message);
        $em->flush();

        return $this->json([
            'id' => $message->getId(),
            'contenu' => $message->getContenu(),
            'createdAt' => $message->getCreatedAt()?->format('Y-m-d H:i:s'),
            'auteur' => [
                'id' => $message->getAuteur()->getId(),
                'nom' => $message->getAuteur()->getNom(),
                'prenom' => $message->getAuteur()->getPrenom(),
                'photo' => $message->getAuteur()->getPhoto(),
            ],
        ], 201);
    }

    #[Route('/{id}', name: 'api_groupes_show', methods: ['GET'])]
    public function show(
        Groupe $groupe,
        MessageGroupeRepository $messageRepo
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        // Vérifier que l'utilisateur est membre du groupe ou créateur
        $isMember = $groupe->getMembreGroupes()->exists(
            fn($key, MembreGroupe $mg) => $mg->getEtudiant()->getId() === $user->getId()
        );

        if (!$isMember && $groupe->getCreateur()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Accès non autorisé'], 403);
        }

        $membres = array_map(fn(MembreGroupe $mg) => [
            'id' => $mg->getEtudiant()->getId(),
            'nom' => $mg->getEtudiant()->getNom(),
            'prenom' => $mg->getEtudiant()->getPrenom(),
            'photo' => $mg->getEtudiant()->getPhoto(),
            'dateAdhesion' => $mg->getDateAdhesion()?->format('Y-m-d H:i:s'),
        ], $groupe->getMembreGroupes()->toArray());

        $messages = $messageRepo->findByGroupeOrderedByDate($groupe->getId());

        $messagesData = array_map(fn(MessageGroupe $m) => [
            'id' => $m->getId(),
            'contenu' => $m->getContenu(),
            'createdAt' => $m->getCreatedAt()?->format('Y-m-d H:i:s'),
            'auteur' => [
                'id' => $m->getAuteur()->getId(),
                'nom' => $m->getAuteur()->getNom(),
                'prenom' => $m->getAuteur()->getPrenom(),
                'photo' => $m->getAuteur()->getPhoto(),
            ],
        ], $messages);

        return $this->json([
            'id' => $groupe->getId(),
            'nom' => $groupe->getNom(),
            'description' => $groupe->getDescription(),
            'membresCount' => $groupe->getMembresCount(),
            'membres' => $membres,
            'messages' => $messagesData,
            'createur' => [
                'id' => $groupe->getCreateur()->getId(),
                'nom' => $groupe->getCreateur()->getNom(),
                'prenom' => $groupe->getCreateur()->getPrenom(),
            ],
            'createdAt' => $groupe->getCreatedAt()?->format('Y-m-d H:i:s'),
        ]);
    }

    #[Route('', name: 'api_groupes_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $em,
        ValidatorInterface $validator
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        $groupe = new Groupe();
        $groupe->setNom($data['nom'] ?? '');
        $groupe->setDescription($data['description'] ?? null);
        $groupe->setCreateur($user);

        $errors = $validator->validate($groupe);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[$error->getPropertyPath()] = $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], 400);
        }

        $em->persist($groupe);

        // Le créateur rejoint automatiquement le groupe
        $membre = new MembreGroupe();
        $membre->setEtudiant($user);
        $membre->setGroupe($groupe);
        $em->persist($membre);

        $em->flush();

        return $this->json([
            'message' => 'Groupe créé',
            'id' => $groupe->getId(),
        ], 201);
    }

    #[Route('/{id}/join', name: 'api_groupes_join', methods: ['POST'])]
    public function join(Groupe $groupe, EntityManagerInterface $em, MembreGroupeRepository $mgRepo): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $existing = $mgRepo->findByEtudiantAndGroupe($user->getId(), $groupe->getId());
        if ($existing) {
            return $this->json(['error' => 'Vous êtes déjà membre de ce groupe'], 400);
        }

        $membre = new MembreGroupe();
        $membre->setEtudiant($user);
        $membre->setGroupe($groupe);
        $em->persist($membre);
        $em->flush();

        return $this->json(['message' => 'Vous avez rejoint le groupe']);
    }

    #[Route('/{id}/leave', name: 'api_groupes_leave', methods: ['POST'])]
    public function leave(Groupe $groupe, EntityManagerInterface $em, MembreGroupeRepository $mgRepo): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $existing = $mgRepo->findByEtudiantAndGroupe($user->getId(), $groupe->getId());
        if (!$existing) {
            return $this->json(['error' => 'Vous n\'êtes pas membre de ce groupe'], 400);
        }

        $em->remove($existing);
        $em->flush();

        return $this->json(['message' => 'Vous avez quitté le groupe']);
    }

    #[Route('/{id}', name: 'api_groupes_delete', methods: ['DELETE'])]
    public function delete(Groupe $groupe, EntityManagerInterface $em): JsonResponse
    {
        if (!$this->isGranted('ROLE_ADMIN')) {
            return $this->json(['error' => 'Accès refusé'], 403);
        }

        $em->remove($groupe);
        $em->flush();

        return $this->json(['message' => 'Groupe supprimé']);
    }
}
