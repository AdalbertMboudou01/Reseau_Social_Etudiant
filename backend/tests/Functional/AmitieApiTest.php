<?php

namespace App\Tests\Functional;

class AmitieApiTest extends ApiTestCase
{
    public function testFriendsListRequiresAuth(): void
    {
        $this->client->request('GET', '/api/amis', [], [], ['HTTP_ACCEPT' => 'application/json']);
        self::assertResponseStatusCodeSame(401);
    }

    public function testFriendsEndpointsReturnJsonArrays(): void
    {
        $token = $this->registerAndLogin('amis@example.com', 'secret12');

        foreach (['/api/amis', '/api/amis/demandes', '/api/amis/sent', '/api/amis/suggestions'] as $path) {
            $this->jsonRequest('GET', $path, null, $this->authHeaders($token));
            self::assertResponseStatusCodeSame(200, 'Échec sur '.$path);
            $data = json_decode($this->client->getResponse()->getContent(), true);
            self::assertIsArray($data, $path.' devrait renvoyer un tableau JSON');
        }
    }
}
