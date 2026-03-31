<?php

namespace App\Controller;

use App\Entity\Commentaire;
use App\Entity\Publication;
use App\Entity\User;
use App\Entity\Notification;
use App\Repository\CommentaireRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/publications/{publicationId}/commentaires')]
class CommentaireController extends AbstractController
{
    #[Route('', name: 'api_commentaires_list', methods: ['GET'])]
    public function index(int $publicationId, CommentaireRepository $repo): JsonResponse
    {
        $commentaires = $repo->findByPublication($publicationId);

        $data = array_map(fn(Commentaire $c) => [
            'id' => $c->getId(),
            'contenu' => $c->getContenu(),
            'auteur' => [
                'id' => $c->getAuteur()->getId(),
                'nom' => $c->getAuteur()->getNom(),
                'prenom' => $c->getAuteur()->getPrenom(),
                'photo' => $c->getAuteur()->getPhoto(),
            ],
            'createdAt' => $c->getCreatedAt()?->format('Y-m-d H:i:s'),
        ], $commentaires);

        return $this->json($data);
    }

    #[Route('', name: 'api_commentaires_create', methods: ['POST'])]
    public function create(
        int $publicationId,
        Request $request,
        EntityManagerInterface $em,
        ValidatorInterface $validator
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $publication = $em->getRepository(Publication::class)->find($publicationId);
        if (!$publication) {
            return $this->json(['error' => 'Publication non trouvée'], 404);
        }

        $data = json_decode($request->getContent(), true);

        $commentaire = new Commentaire();
        $commentaire->setContenu($data['contenu'] ?? '');
        $commentaire->setAuteur($user);
        $commentaire->setPublication($publication);

        $errors = $validator->validate($commentaire);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[$error->getPropertyPath()] = $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], 400);
        }

        $em->persist($commentaire);

        // Create notification for publication author
        if ($publication->getAuteur()->getId() !== $user->getId()) {
            $notification = new Notification();
            $notification->setUtilisateur($publication->getAuteur());
            $notification->setType('comment');
            $notification->setAuteur($user);
            $notification->setContenu('a commenté votre publication');
            $notification->setRelatedId($publication->getId());
            $notification->setRelatedType('publication');
            $notification->setLue(false);
            $em->persist($notification);
        }

        $em->flush();

        return $this->json([
            'message' => 'Commentaire ajouté',
            'id' => $commentaire->getId(),
        ], 201);
    }

    #[Route('/{id}', name: 'api_commentaires_delete', methods: ['DELETE'])]
    public function delete(
        int $publicationId,
        Commentaire $commentaire,
        EntityManagerInterface $em
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        if ($commentaire->getAuteur() !== $user && !$this->isGranted('ROLE_ADMIN')) {
            return $this->json(['error' => 'Accès refusé'], 403);
        }

        $em->remove($commentaire);
        $em->flush();

        return $this->json(['message' => 'Commentaire supprimé']);
    }
}
