// Divide & Conquer: Closest Pair of Points in 2D
// Time Complexity: O(n log n) compared to Brute Force O(n^2)

export function distance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function solveClosestPairBruteForce(points) {
  const steps = [];
  let minDist = Infinity;
  let bestPair = null;
  let comparisons = 0;
  const n = points.length;

  steps.push({
    type: 'BRUTE_INIT',
    message: `[FORÇA BRUTA O(n²)] Iniciando checagem de todos os ${Math.round(n * (n - 1) / 2)} pares possíveis.`,
    data: { points }
  });

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      comparisons++;
      const d = distance(points[i], points[j]);
      const isNewBest = d < minDist;
      if (isNewBest) {
        minDist = d;
        bestPair = [points[i], points[j]];
      }

      steps.push({
        type: isNewBest ? 'STRIP_FOUND_BETTER' : 'BRUTE_CHECK',
        message: `Comparando Alvo #${points[i].id} com Alvo #${points[j].id}: Distância = ${d.toFixed(1)}px (Comparação #${comparisons})${isNewBest ? ' ★ NOVO RECORDE!' : ''}`,
        data: {
          currentPair: [points[i], points[j]],
          currentDist: d,
          bestPair,
          minDist,
          comparisons
        }
      });
    }
  }

  steps.push({
    type: 'COMPLETED',
    message: `[FORÇA BRUTA CONCLUÍDA] Foram necessárias ${comparisons} comparações para encontrar a menor distância (${minDist.toFixed(1)}px).`,
    data: { finalPair: bestPair, finalDist: minDist, comparisons, isBruteForce: true }
  });

  return { minDist, pair: bestPair, comparisons, steps };
}

export function solveClosestPairDC(points) {
  const steps = [];
  let comparisons = 0;

  // Step 1: Pre-sort points by X coordinate
  const ptsSortedX = [...points].sort((a, b) => a.x - b.x);

  steps.push({
    type: 'INIT',
    message: `Iniciando Dividir e Conquistar com ${points.length} projéteis ordenados por X.`,
    data: { points: ptsSortedX }
  });

  function closestPairRec(pts) {
    const n = pts.length;

    // Base Case: 2 or 3 points -> Brute Force local
    if (n <= 3) {
      let minD = Infinity;
      let minPair = null;
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          comparisons++;
          const d = distance(pts[i], pts[j]);
          if (d < minD) {
            minD = d;
            minPair = [pts[i], pts[j]];
          }
        }
      }
      steps.push({
        type: 'BASE_CASE',
        message: `Caso Base (n=${n}): Par mais próximo local dist=${minD.toFixed(1)}px`,
        data: { subset: pts, pair: minPair, dist: minD }
      });
      return { dist: minD, pair: minPair };
    }

    // DIVIDE: Find mid point
    const midIdx = Math.floor(n / 2);
    const midPoint = pts[midIdx];
    const leftPts = pts.slice(0, midIdx);
    const rightPts = pts.slice(midIdx);

    steps.push({
      type: 'DIVIDE',
      message: `DIVIDIR: Linha de Fissura em X = ${Math.round(midPoint.x)}. Esquerda: ${leftPts.length} alvos, Direita: ${rightPts.length} alvos.`,
      data: { splitX: midPoint.x, leftPts, rightPts }
    });

    // CONQUER: Recursively solve left and right halves
    const leftResult = closestPairRec(leftPts);
    const rightResult = closestPairRec(rightPts);

    let d = Math.min(leftResult.dist, rightResult.dist);
    let bestPair = leftResult.dist < rightResult.dist ? leftResult.pair : rightResult.pair;

    steps.push({
      type: 'CONQUER_HALVES',
      message: `CONQUISTAR: Menor distância entre metades: δ = ${d.toFixed(1)}px`,
      data: { splitX: midPoint.x, delta: d, currentBest: bestPair }
    });

    // COMBINE: Strip of points within d distance from mid line
    const strip = [];
    for (let i = 0; i < n; i++) {
      if (Math.abs(pts[i].x - midPoint.x) < d) {
        strip.push(pts[i]);
      }
    }

    // Sort strip by Y
    strip.sort((a, b) => a.y - b.y);

    steps.push({
      type: 'STRIP_CHECK',
      message: `COMBINAR: Verificando ${strip.length} pontos na faixa central [X ± ${d.toFixed(0)}px] ordenados por Y.`,
      data: { splitX: midPoint.x, delta: d, strip }
    });

    // Check at most 7 neighbors in strip
    for (let i = 0; i < strip.length; i++) {
      for (let j = i + 1; j < strip.length && (strip[j].y - strip[i].y) < d; j++) {
        comparisons++;
        const distIJ = distance(strip[i], strip[j]);
        if (distIJ < d) {
          d = distIJ;
          bestPair = [strip[i], strip[j]];
          steps.push({
            type: 'STRIP_FOUND_BETTER',
            message: `⚡ NOVO PAR CRÍTICO NA FAIXA CENTRAL! Distância: ${d.toFixed(1)}px`,
            data: { pair: bestPair, dist: d }
          });
        }
      }
    }

    return { dist: d, pair: bestPair };
  }

  const result = closestPairRec(ptsSortedX);

  steps.push({
    type: 'COMPLETED',
    message: `ALGORITMO D&C CONCLUÍDO! Par Crítico detectado: Distância = ${result.dist.toFixed(1)}px com apenas ${comparisons} comparações (vs Força Bruta ${Math.round(points.length * (points.length - 1) / 2)}).`,
    data: { finalPair: result.pair, finalDist: result.dist, comparisons, isBruteForce: false }
  });

  return {
    minDist: result.dist,
    pair: result.pair,
    comparisons,
    steps,
  };
}
