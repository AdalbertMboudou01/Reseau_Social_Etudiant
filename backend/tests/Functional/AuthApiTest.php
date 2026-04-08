<?php

namespace App\Tests\Functional;

class AuthApiTest extends ApiTestCase
{
    public function testRegisterRejectsInvalidJson(): void
    {
        $this->client->request('POST', '/api/register', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_ACCEPT' => 'application/json',
        ], 'not-json');
        self::assertResponseStatusCodeSame(400);
    }

    public function testRegisterValidationError(): void
    {
        $this->jsonRequest('POST', '/api/register', [
            'email' => 'pas-un-email',
            'password' => 'secret12',
            'nom' => 'X',
            'prenom' => 'Y',
        ]);
        self::assertResponseStatusCodeSame(400);
        $data = json_decode($this->client->getResponse()->getContent(), true);
        self::assertArrayHasKey('errors', $data);
    }

    public function testRegisterRejectsShortPassword(): void
    {
        $this->jsonRequest('POST', '/api/register', [
            'email' => 'user@example.com',
            'password' => '12345',
            'nom' => 'Nom',
            'prenom' => 'Prenom',
        ]);
        self::assertResponseStatusCodeSame(400);
        $data = json_decode($this->client->getResponse()->getContent(), true);
        self::assertArrayHasKey('error', $data);
    }

    public function testRegisterSuccess(): void
    {
        $this->jsonRequest('POST', '/api/register', [
            'email' => 'nouveau@example.com',
            'password' => 'secret12',
            'nom' => 'Martin',
            'prenom' => 'Claire',
        ]);
        self::assertResponseStatusCodeSame(201);
        $data = json_decode($this->client->getResponse()->getContent(), true);
        self::assertSame('Utilisateur créé avec succès', $data['message']);
        self::assertSame('nouveau@example.com', $data['user']['email']);
    }

    public function testProfileRequiresAuthentication(): void
    {
        $this->client->request('GET', '/api/profile', [], [], ['HTTP_ACCEPT' => 'application/json']);
        self::assertResponseStatusCodeSame(401);
    }

    public function testLoginAndProfile(): void
    {
        $token = $this->registerAndLogin('auth@example.com', 'secret12');

        $this->jsonRequest('GET', '/api/profile', null, $this->authHeaders($token));
        self::assertResponseStatusCodeSame(200);
        $data = json_decode($this->client->getResponse()->getContent(), true);
        self::assertSame('auth@example.com', $data['email']);
        self::assertSame('Jean', $data['prenom']);
    }

    public function testPublicUserProfile(): void
    {
        $token = $this->registerAndLogin('public@example.com', 'secret12');
        $this->jsonRequest('GET', '/api/profile', null, $this->authHeaders($token));
        $me = json_decode($this->client->getResponse()->getContent(), true);
        $id = $me['id'];

        $this->jsonRequest('GET', '/api/users/'.$id, null, $this->authHeaders($token));
        self::assertResponseStatusCodeSame(200);
        $data = json_decode($this->client->getResponse()->getContent(), true);
        self::assertSame($id, $data['id']);
        self::assertSame('public@example.com', $data['email']);
    }
}
