<?php

namespace App\Controller;

use App\Entity\Groupe;
use App\Entity\MembreGroupe;
use App\Entity\User;
use App\Repository\GroupeRepository;
use App\Repository\MembreGroupeRepository;
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
            'createur' => [
                'id' => $g->getCreateur()->getId(),
                'nom' => $g->getCreateur()->getNom(),
                'prenom' => $g->getCreateur()->getPrenom(),
            ],
            'createdAt' => $g->getCreatedAt()?->format('Y-m-d H:i:s'),
        ], $groupes);

        return $this->json($data);
    }

    #[Route('/{id}', name: 'api_groupes_show', methods: ['GET'])]
    public function show(Groupe $groupe): JsonResponse
    {
        $membres = array_map(fn(MembreGroupe $mg) => [
            'id' => $mg->getEtudiant()->getId(),
            'nom' => $mg->getEtudiant()->getNom(),
            'prenom' => $mg->getEtudiant()->getPrenom(),
            'photo' => $mg->getEtudiant()->getPhoto(),
            'dateAdhesion' => $mg->getDateAdhesion()?->format('Y-m-d H:i:s'),
        ], $groupe->getMembreGroupes()->toArray());

        return $this->json([
            'id' => $groupe->getId(),
            'nom' => $groupe->getNom(),
            'description' => $groupe->getDescription(),
            'membresCount' => $groupe->getMembresCount(),
            'membres' => $membres,
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
