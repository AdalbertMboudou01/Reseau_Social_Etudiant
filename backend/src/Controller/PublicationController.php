<?php

namespace App\Controller;

use App\Entity\Publication;
use App\Entity\Like;
use App\Entity\User;
use App\Repository\LikeRepository;
use App\Repository\PublicationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/publications')]
class PublicationController extends AbstractController
{
    #[Route('', name: 'api_publications_list', methods: ['GET'])]
    public function index(PublicationRepository $repo): JsonResponse
    {
        $publications = $repo->findAllOrderedByDate();

        $data = array_map(fn(Publication $p) => [
            'id' => $p->getId(),
            'contenu' => $p->getContenu(),
            'image' => $p->getImage(),
            'likesCount' => $p->getLikesCount(),
            'auteur' => [
                'id' => $p->getAuteur()->getId(),
                'nom' => $p->getAuteur()->getNom(),
                'prenom' => $p->getAuteur()->getPrenom(),
                'photo' => $p->getAuteur()->getPhoto(),
            ],
            'createdAt' => $p->getCreatedAt()?->format('Y-m-d H:i:s'),
        ], $publications);

        return $this->json($data);
    }

    #[Route('/{id}', name: 'api_publications_show', methods: ['GET'])]
    public function show(Publication $publication): JsonResponse
    {
        return $this->json([
            'id' => $publication->getId(),
            'contenu' => $publication->getContenu(),
            'image' => $publication->getImage(),
            'likesCount' => $publication->getLikesCount(),
            'auteur' => [
                'id' => $publication->getAuteur()->getId(),
                'nom' => $publication->getAuteur()->getNom(),
                'prenom' => $publication->getAuteur()->getPrenom(),
                'photo' => $publication->getAuteur()->getPhoto(),
            ],
            'createdAt' => $publication->getCreatedAt()?->format('Y-m-d H:i:s'),
        ]);
    }

    #[Route('', name: 'api_publications_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $em,
        ValidatorInterface $validator
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        $publication = new Publication();
        $publication->setContenu($data['contenu'] ?? '');
        $publication->setType($data['type'] ?? 'texte');
        $publication->setAuteur($user);

        if (!empty($data['image'])) {
            $publication->setImage($data['image']);
        }

        $errors = $validator->validate($publication);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[$error->getPropertyPath()] = $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], 400);
        }

        $em->persist($publication);
        $em->flush();

        return $this->json([
            'message' => 'Publication créée',
            'id' => $publication->getId(),
        ], 201);
    }

    #[Route('/{id}', name: 'api_publications_update', methods: ['PUT'])]
    public function update(
        Publication $publication,
        Request $request,
        EntityManagerInterface $em,
        ValidatorInterface $validator
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        if ($publication->getAuteur() !== $user && !$this->isGranted('ROLE_ADMIN')) {
            return $this->json(['error' => 'Accès refusé'], 403);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['contenu'])) {
            $publication->setContenu($data['contenu']);
        }
        if (isset($data['type'])) {
            $publication->setType($data['type']);
        }
        if (array_key_exists('image', $data)) {
            $publication->setImage($data['image']);
        }

        $publication->setUpdatedAt(new \DateTimeImmutable());

        $errors = $validator->validate($publication);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[$error->getPropertyPath()] = $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], 400);
        }

        $em->flush();

        return $this->json([
            'message' => 'Publication mise à jour',
            'id' => $publication->getId(),
        ]);
    }

    #[Route('/{id}', name: 'api_publications_delete', methods: ['DELETE'])]
    public function delete(Publication $publication, EntityManagerInterface $em): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        if ($publication->getAuteur() !== $user && !$this->isGranted('ROLE_ADMIN')) {
            return $this->json(['error' => 'Accès refusé'], 403);
        }

        $em->remove($publication);
        $em->flush();

        return $this->json(['message' => 'Publication supprimée']);
    }

    #[Route('/{id}/like', name: 'api_publications_like', methods: ['POST'])]
    public function like(
        Publication $publication,
        EntityManagerInterface $em,
        LikeRepository $likeRepo
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $existingLike = $likeRepo->findByUserAndPublication($user->getId(), $publication->getId());

        if ($existingLike) {
            $em->remove($existingLike);
            $em->flush();
            return $this->json(['message' => 'Like retiré', 'liked' => false]);
        }

        $like = new Like();
        $like->setUser($user);
        $like->setPublication($publication);

        $em->persist($like);
        $em->flush();

        return $this->json(['message' => 'Publication likée', 'liked' => true], 201);
    }
}
