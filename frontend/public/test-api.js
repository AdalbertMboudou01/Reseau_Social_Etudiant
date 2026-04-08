/**
 * Test manual pour débugger les appels API
 * À ouvrir dans la console DevTools (F12) sur n'importe quelle page
 */

const testApiCalls = async () => {
  let token = localStorage.getItem('token');
  if (token) {
    token = token.trim().replace(/^["']|["']$/g, '');
  }
  if (!token) {
    console.error('❌ Aucun token dans localStorage. Connecte-toi sur http://localhost:3000 puis relance ce script.');
    return;
  }
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  console.log('🔍 Test des endpoints API...\n');

  try {
    console.log('1️⃣ Testant /api/amis (amis)...');
    const friendsRes = await fetch('http://localhost:8000/api/amis', { headers });
    console.log('   Status:', friendsRes.status);
    const friendsData = await friendsRes.json();
    console.log('   Data:', friendsData);
    console.log('   Nombre:', Array.isArray(friendsData) ? friendsData.length : 'erreur');
  } catch (e) {
    console.error('   ❌ Erreur:', e.message);
  }

  try {
    console.log('\n2️⃣ Testant /api/amis/demandes (pending)...');
    const pendingRes = await fetch('http://localhost:8000/api/amis/demandes', { headers });
    console.log('   Status:', pendingRes.status);
    const pendingData = await pendingRes.json();
    console.log('   Data:', pendingData);
    console.log('   Nombre:', Array.isArray(pendingData) ? pendingData.length : 'erreur');
  } catch (e) {
    console.error('   ❌ Erreur:', e.message);
  }

  try {
    console.log('\n3️⃣ Testant /api/amis/sent (envoyées)...');
    const sentRes = await fetch('http://localhost:8000/api/amis/sent', { headers });
    console.log('   Status:', sentRes.status);
    const sentData = await sentRes.json();
    console.log('   Data:', sentData);
    console.log('   Nombre:', Array.isArray(sentData) ? sentData.length : 'erreur');
  } catch (e) {
    console.error('   ❌ Erreur:', e.message);
  }

  try {
    console.log('\n4️⃣ Testant /api/amis/suggestions (suggestions)...');
    const suggestionsRes = await fetch('http://localhost:8000/api/amis/suggestions', { headers });
    console.log('   Status:', suggestionsRes.status);
    const suggestionsData = await suggestionsRes.json();
    console.log('   Data:', suggestionsData);
    console.log('   Nombre:', Array.isArray(suggestionsData) ? suggestionsData.length : 'erreur');
  } catch (e) {
    console.error('   ❌ Erreur:', e.message);
  }

  console.log('\n✅ Test terminé! Vérifiez les résultats ci-dessus.');
};

// Exécuter le test
testApiCalls();
