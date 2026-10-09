import fs from 'fs';

async function runTests() {
  const leafBase64 = fs.readFileSync('/tmp/real_leaf.jpg').toString('base64');
  const flowerBase64 = fs.readFileSync('/tmp/real_flower.jpg').toString('base64');

  console.log('--- TEST 1: Real Plant Leaf Photo Analysis ---');
  const res1 = await fetch('http://localhost:3000/api/analyze-plant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: { base64: leafBase64, mimeType: 'image/jpeg' },
      userContext: { userType: 'farmer', cropName: 'Crop', districtName: 'Rajkot' },
      lang: 'en',
    }),
  });
  const data1 = await res1.json();
  console.log('TEST 1 Status:', res1.status);
  console.log('TEST 1 Result:\n', JSON.stringify(data1.data, null, 2));

  console.log('\n--- TEST 2: Different Plant Specimen Photo Analysis ---');
  const res2 = await fetch('http://localhost:3000/api/analyze-plant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: { base64: flowerBase64, mimeType: 'image/jpeg' },
      userContext: { userType: 'urban', cropName: 'Flower', districtName: 'Rajkot' },
      lang: 'en',
    }),
  });
  const data2 = await res2.json();
  console.log('TEST 2 Status:', res2.status);
  console.log('TEST 2 Result:\n', JSON.stringify(data2.data, null, 2));

  console.log('\n--- COMPARISON / VERIFICATION ---');
  console.log('Test 1 isPlantImage:', data1.data?.isPlantImage);
  console.log('Test 1 Condition:', data1.data?.condition, 'Confidence:', data1.data?.confidence);
  console.log('Test 2 isPlantImage:', data2.data?.isPlantImage);
  console.log('Test 2 Condition:', data2.data?.condition, 'Confidence:', data2.data?.confidence);
  console.log('Are results distinct and non-hardcoded?:', data1.data?.condition !== data2.data?.condition);
}

runTests();
