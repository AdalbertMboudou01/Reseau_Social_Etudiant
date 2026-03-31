<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api')]
class AuthController extends AbstractController
{
    #[Route('/register', name: 'api_register', methods: ['POST'])]
    public function register(
        Request $request,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $em,
        ValidatorInterface $validator
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['error' => 'Données invalides'], 400);
        }

        $user = new User();
        $user->setEmail($data['email'] ?? '');
        $user->setNom($data['nom'] ?? '');
        $user->setPrenom($data['prenom'] ?? '');
        $user->setRoles(['ROLE_ETUDIANT']);

        if (!empty($data['universite'])) {
            $user->setUniversite($data['universite']);
        }
        if (!empty($data['filiere'])) {
            $user->setFiliere($data['filiere']);
        }
        if (!empty($data['anneeEtude'])) {
            $user->setAnneeEtude((int) $data['anneeEtude']);
        }
        if (!empty($data['bio'])) {
            $user->setBio($data['bio']);
        }

        $errors = $validator->validate($user);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[$error->getPropertyPath()] = $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], 400);
        }

        if (empty($data['password']) || strlen($data['password']) < 6) {
            return $this->json(['error' => 'Le mot de passe doit contenir au moins 6 caractères'], 400);
        }

        $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);

        $em->persist($user);
        $em->flush();

        return $this->json([
            'message' => 'Utilisateur créé avec succès',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'nom' => $user->getNom(),
                'prenom' => $user->getPrenom(),
                'roles' => $user->getRoles(),
            ]
        ], 201);
    }

    #[Route('/login', name: 'api_login', methods: ['POST'])]
    public function login(): JsonResponse
    {
        // Ce point de terminaison est géré par le firewall json_login de Symfony.
        // Si vous voyez cette exception, la sécurité n'a pas intercepté la requête.
        throw new \RuntimeException('Route /api/login non gérée par json_login.');
    }

    #[Route('/profile', name: 'api_profile', methods: ['GET'])]
    public function profile(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'nom' => $user->getNom(),
            'prenom' => $user->getPrenom(),
            'photo' => $user->getPhoto(),
            'bio' => $user->getBio(),
            'universite' => $user->getUniversite(),
            'filiere' => $user->getFiliere(),
            'anneeEtude' => $user->getAnneeEtude(),
            'roles' => $user->getRoles(),
            'createdAt' => $user->getCreatedAt()?->format('Y-m-d H:i:s'),
        ]);
    }

    #[Route('/profile', name: 'api_profile_update', methods: ['PUT'])]
    public function updateProfile(
        Request $request,
        EntityManagerInterface $em,
        ValidatorInterface $validator
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        if (isset($data['nom'])) {
            $user->setNom($data['nom']);
        }
        if (isset($data['prenom'])) {
            $user->setPrenom($data['prenom']);
        }
        if (isset($data['bio'])) {
            $user->setBio($data['bio']);
        }
        if (isset($data['photo'])) {
            $user->setPhoto($data['photo']);
        }
        if (isset($data['universite'])) {
            $user->setUniversite($data['universite']);
        }
        if (isset($data['filiere'])) {
            $user->setFiliere($data['filiere']);
        }
        if (isset($data['anneeEtude'])) {
            $user->setAnneeEtude((int) $data['anneeEtude']);
        }

        $errors = $validator->validate($user);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[$error->getPropertyPath()] = $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], 400);
        }

        $em->flush();

        return $this->json([
            'message' => 'Profil mis à jour',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'nom' => $user->getNom(),
                'prenom' => $user->getPrenom(),
                'photo' => $user->getPhoto(),
                'bio' => $user->getBio(),
            ]
        ]);
    }

    #[Route('/users/{id}', name: 'api_public_profile', methods: ['GET'])]
    public function getPublicProfile(User $user): JsonResponse
    {
        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'nom' => $user->getNom(),
            'prenom' => $user->getPrenom(),
            'photo' => $user->getPhoto(),
            'bio' => $user->getBio(),
            'universite' => $user->getUniversite(),
            'filiere' => $user->getFiliere(),
            'anneeEtude' => $user->getAnneeEtude(),
            'createdAt' => $user->getCreatedAt()?->format('Y-m-d H:i:s'),
        ]);
    }
}
