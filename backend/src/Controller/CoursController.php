<?php

namespace App\Controller;

use App\Entity\Cours;
use App\Entity\User;
use App\Repository\CoursRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/cours')]
class CoursController extends AbstractController
{
    #[Route('', name: 'api_cours_list', methods: ['GET'])]
    public function index(CoursRepository $repo): JsonResponse
    {
        $cours = $repo->findPublished();

        $data = array_map(fn(Cours $c) => [
            'id' => $c->getId(),
            'titre' => $c->getTitre(),
            'description' => $c->getDescription(),
            'fichier' => $c->getFichier(),
            'auteur' => [
                'id' => $c->getAuteur()->getId(),
                'nom' => $c->getAuteur()->getNom(),
                'prenom' => $c->getAuteur()->getPrenom(),
            ],
            'createdAt' => $c->getCreatedAt()?->format('Y-m-d H:i:s'),
        ], $cours);

        return $this->json($data);
    }

    #[Route('/{id}', name: 'api_cours_show', methods: ['GET'])]
    public function show(Cours $cours): JsonResponse
    {
        return $this->json([
            'id' => $cours->getId(),
            'titre' => $cours->getTitre(),
            'description' => $cours->getDescription(),
            'fichier' => $cours->getFichier(),
            'isPublished' => $cours->isPublished(),
            'auteur' => [
                'id' => $cours->getAuteur()->getId(),
                'nom' => $cours->getAuteur()->getNom(),
                'prenom' => $cours->getAuteur()->getPrenom(),
            ],
            'createdAt' => $cours->getCreatedAt()?->format('Y-m-d H:i:s'),
        ]);
    }

    #[Route('', name: 'api_cours_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $em,
        ValidatorInterface $validator
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        $cours = new Cours();
        $cours->setTitre($data['titre'] ?? '');
        $cours->setDescription($data['description'] ?? '');
        $cours->setAuteur($user);

        if (!empty($data['fichier'])) {
            $cours->setFichier($data['fichier']);
        }
        if (isset($data['isPublished'])) {
            $cours->setIsPublished((bool) $data['isPublished']);
        }

        $errors = $validator->validate($cours);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[$error->getPropertyPath()] = $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], 400);
        }

        $em->persist($cours);
        $em->flush();

        return $this->json([
            'message' => 'Cours créé',
            'id' => $cours->getId(),
        ], 201);
    }

    #[Route('/{id}', name: 'api_cours_update', methods: ['PUT'])]
    public function update(
        Cours $cours,
        Request $request,
        EntityManagerInterface $em,
        ValidatorInterface $validator
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        if ($cours->getAuteur() !== $user && !$this->isGranted('ROLE_ADMIN')) {
            return $this->json(['error' => 'Accès refusé'], 403);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['titre'])) {
            $cours->setTitre($data['titre']);
        }
        if (isset($data['description'])) {
            $cours->setDescription($data['description']);
        }
        if (array_key_exists('fichier', $data)) {
            $cours->setFichier($data['fichier']);
        }

        $cours->setUpdatedAt(new \DateTimeImmutable());

        $errors = $validator->validate($cours);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[$error->getPropertyPath()] = $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], 400);
        }

        $em->flush();

        return $this->json([
            'message' => 'Cours mis à jour',
            'id' => $cours->getId(),
        ]);
    }

    #[Route('/{id}/publish', name: 'api_cours_publish', methods: ['PATCH'])]
    public function publish(Cours $cours, EntityManagerInterface $em): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        if ($cours->getAuteur() !== $user) {
            return $this->json(['error' => 'Accès refusé'], 403);
        }

        $cours->setIsPublished(true);
        $cours->setUpdatedAt(new \DateTimeImmutable());
        $em->flush();

        return $this->json(['message' => 'Cours publié']);
    }

    #[Route('/{id}', name: 'api_cours_delete', methods: ['DELETE'])]
    public function delete(Cours $cours, EntityManagerInterface $em): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        if ($cours->getAuteur() !== $user && !$this->isGranted('ROLE_ADMIN')) {
            return $this->json(['error' => 'Accès refusé'], 403);
        }

        $em->remove($cours);
        $em->flush();

        return $this->json(['message' => 'Cours supprimé']);
    }
}
