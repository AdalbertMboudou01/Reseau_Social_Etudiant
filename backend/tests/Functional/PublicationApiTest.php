<?php

namespace App\Tests\Functional;

class PublicationApiTest extends ApiTestCase
{
    public function testListRequiresAuth(): void
    {
        $this->client->request('GET', '/api/publications', [], [], ['HTTP_ACCEPT' => 'application/json']);
        self::assertResponseStatusCodeSame(401);
    }

    public function testListReturnsPaginatedStructure(): void
    {
        $token = $this->registerAndLogin('pub@example.com', 'secret12');
        $this->jsonRequest('GET', '/api/publications', null, $this->authHeaders($token));
        self::assertResponseStatusCodeSame(200);
        $data = json_decode($this->client->getResponse()->getContent(), true);
        self::assertArrayHasKey('items', $data);
        self::assertArrayHasKey('pagination', $data);
        self::assertIsArray($data['items']);
        self::assertArrayHasKey('page', $data['pagination']);
    }

    public function testCreateAndShowPublication(): void
    {
        $token = $this->registerAndLogin('author@example.com', 'secret12');

        $this->jsonRequest('POST', '/api/publications', [
            'contenu' => 'Hello test PHPUnit',
        ], $this->authHeaders($token));
        self::assertResponseStatusCodeSame(201);
        $created = json_decode($this->client->getResponse()->getContent(), true);
        self::assertArrayHasKey('id', $created);
        $id = $created['id'];

        $this->jsonRequest('GET', '/api/publications/'.$id, null, $this->authHeaders($token));
        self::assertResponseStatusCodeSame(200);
        $show = json_decode($this->client->getResponse()->getContent(), true);
        self::assertSame('Hello test PHPUnit', $show['contenu']);
    }
}
