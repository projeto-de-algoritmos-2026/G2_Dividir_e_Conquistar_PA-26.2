// Divide & Conquer: The Skyline Problem
// Time Complexity: O(n log n) with T(n) = 2T(n/2) + O(n)
// Given a list of buildings [left, height, right], compute the visible outline.

export function solveSkylineDC(buildings) {
  const steps = [];
  let mergesCount = 0;

  // Clone and sort buildings by left coordinate
  const sortedBuildings = [...buildings].sort((a, b) => a.left - b.left);

  steps.push({
    type: 'INIT',
    message: `Iniciando Dividir e Conquistar do Skyline com ${buildings.length} edifícios.`,
    data: { buildings: sortedBuildings }
  });

  function skylineRec(bList, depth = 0) {
    const n = bList.length;

    // Base Case 1: Empty
    if (n === 0) return [];

    // Base Case 2: Single Building [L, H, R] -> Skyline: [(L, H), (R, 0)]
    if (n === 1) {
      const b = bList[0];
      const singleSkyline = [
        { x: b.left, h: b.height },
        { x: b.right, h: 0 }
      ];
      steps.push({
        type: 'BASE_CASE',
        message: `Caso Base (Torre Única): L=${b.left}, Altura=${b.height}, R=${b.right}`,
        data: { building: b, skyline: singleSkyline }
      });
      return singleSkyline;
    }

    // DIVIDE: Split into two halves
    const mid = Math.floor(n / 2);
    const leftHalf = bList.slice(0, mid);
    const rightHalf = bList.slice(mid);

    steps.push({
      type: 'DIVIDE',
      message: `DIVIDIR: Separando ${n} torres em duas metades (${leftHalf.length} e ${rightHalf.length}).`,
      data: { leftHalf, rightHalf }
    });

    // CONQUER: Recursively solve both halves
    const leftSkyline = skylineRec(leftHalf, depth + 1);
    const rightSkyline = skylineRec(rightHalf, depth + 1);

    // COMBINE: Merge the two skylines
    mergesCount++;
    const merged = mergeSkylines(leftSkyline, rightSkyline);

    steps.push({
      type: 'MERGE_SKYLINES',
      message: `COMBINAR: Fusão de silhuetas concluída. Plataforma contínua gerada com ${merged.length} vértices.`,
      data: { merged }
    });

    return merged;
  }

  // Merge step for two skylines (O(n))
  function mergeSkylines(sk1, sk2) {
    let i = 0;
    let j = 0;
    let h1 = 0;
    let h2 = 0;
    let currentH = 0;
    const result = [];

    while (i < sk1.length && j < sk2.length) {
      const p1 = sk1[i];
      const p2 = sk2[j];
      let x = 0;

      if (p1.x < p2.x) {
        x = p1.x;
        h1 = p1.h;
        i++;
      } else if (p2.x < p1.x) {
        x = p2.x;
        h2 = p2.h;
        j++;
      } else {
        x = p1.x;
        h1 = p1.h;
        h2 = p2.h;
        i++;
        j++;
      }

      const maxH = Math.max(h1, h2);
      if (maxH !== currentH) {
        currentH = maxH;
        result.push({ x, h: currentH });
      }
    }

    // Append remaining points from sk1
    while (i < sk1.length) {
      const p1 = sk1[i];
      if (p1.h !== currentH) {
        currentH = p1.h;
        result.push({ x: p1.x, h: currentH });
      }
      i++;
    }

    // Append remaining points from sk2
    while (j < sk2.length) {
      const p2 = sk2[j];
      if (p2.h !== currentH) {
        currentH = p2.h;
        result.push({ x: p2.x, h: currentH });
      }
      j++;
    }

    return result;
  }

  const finalSkyline = skylineRec(sortedBuildings);

  steps.push({
    type: 'COMPLETED',
    message: `PONTE DO HORIZONTE CONSTRUÍDA! O herói agora pode caminhar com segurança sobre a silhueta das torres.`,
    data: { finalSkyline, mergesCount }
  });

  return {
    skyline: finalSkyline,
    steps,
  };
}
