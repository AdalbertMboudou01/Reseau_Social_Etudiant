<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/admin')]
class AdminController extends AbstractController
{
    #[Route('/users', name: 'api_admin_users_list', methods: ['GET'])]
    public function listUsers(UserRepository $repo): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $users = $repo->findAll();

        $data = array_map(fn(User $u) => [
            'id' => $u->getId(),
            'email' => $u->getEmail(),
            'nom' => $u->getNom(),
            'prenom' => $u->getPrenom(),
            'roles' => $u->getRoles(),
            'isActive' => $u->isActive(),
            'createdAt' => $u->getCreatedAt()?->format('Y-m-d H:i:s'),
        ], $users);

        return $this->json($data);
    }

    #[Route('/users/{id}', name: 'api_admin_users_show', methods: ['GET'])]
    public function showUser(User $user): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'nom' => $user->getNom(),
            'prenom' => $user->getPrenom(),
            'roles' => $user->getRoles(),
            'isActive' => $user->isActive(),
            'photo' => $user->getPhoto(),
            'bio' => $user->getBio(),
            'createdAt' => $user->getCreatedAt()?->format('Y-m-d H:i:s'),
        ]);
    }

    #[Route('/users/{id}/deactivate', name: 'api_admin_users_deactivate', methods: ['PATCH'])]
    public function deactivateUser(User $targetUser, EntityManagerInterface $em): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $targetUser->setIsActive(false);
        $em->flush();

        return $this->json(['message' => 'Utilisateur désactivé']);
    }

    #[Route('/users/{id}/activate', name: 'api_admin_users_activate', methods: ['PATCH'])]
    public function activateUser(User $targetUser, EntityManagerInterface $em): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $targetUser->setIsActive(true);
        $em->flush();

        return $this->json(['message' => 'Utilisateur activé']);
    }

    #[Route('/users/{id}', name: 'api_admin_users_delete', methods: ['DELETE'])]
    public function deleteUser(User $targetUser, EntityManagerInterface $em): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $em->remove($targetUser);
        $em->flush();

        return $this->json(['message' => 'Utilisateur supprimé']);
    }
}
