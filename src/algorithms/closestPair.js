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
    data: { points, operationsCount: 0, depth: 0, isBruteForce: true }
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
          comparisons,
          operationsCount: comparisons,
          depth: 1,
          isBruteForce: true
        }
      });
    }
  }

  steps.push({
    type: 'COMPLETED',
    message: `[FORÇA BRUTA CONCLUÍDA] Foram necessárias ${comparisons} comparações para encontrar a menor distância (${minDist.toFixed(1)}px).`,
    data: {
      finalPair: bestPair,
      finalDist: minDist,
      comparisons,
      operationsCount: comparisons,
      bruteForceOps: comparisons,
      maxDepth: 1,
      isBruteForce: true
    }
  });

  return {
    minDist,
    pair: bestPair,
    comparisons,
    operationsCount: comparisons,
    bruteForceOps: comparisons,
    maxDepth: 1,
    steps
  };
}

export function solveClosestPairDC(points) {
  const steps = [];
  let comparisons = 0;
  let maxDepth = 0;
  const bruteForceOps = Math.round((points.length * (points.length - 1)) / 2);

  // Step 1: Pre-sort points by X coordinate
  const ptsSortedX = [...points].sort((a, b) => a.x - b.x);

  steps.push({
    type: 'INIT',
    message: `Iniciando Dividir e Conquistar com ${points.length} projéteis ordenados por X.`,
    data: { points: ptsSortedX, operationsCount: 0, depth: 0 }
  });

  function closestPairRec(pts, depth = 0) {
    if (depth > maxDepth) maxDepth = depth;
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
        message: `Caso Base (Nível ${depth}, n=${n}): Par mais próximo local dist=${minD.toFixed(1)}px`,
        data: {
          subset: pts,
          pair: minPair,
          currentPair: minPair,
          dist: minD,
          depth,
          operationsCount: comparisons
        }
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
      message: `DIVIDIR (Nível ${depth}): Linha de Fissura em X = ${Math.round(midPoint.x)}. Esquerda: ${leftPts.length} alvos, Direita: ${rightPts.length} alvos.`,
      data: {
        splitX: midPoint.x,
        leftPts,
        rightPts,
        subset: pts,
        depth,
        operationsCount: comparisons
      }
    });

    // CONQUER: Recursively solve left and right halves
    const leftResult = closestPairRec(leftPts, depth + 1);
    const rightResult = closestPairRec(rightPts, depth + 1);

    let d = Math.min(leftResult.dist, rightResult.dist);
    let bestPair = leftResult.dist < rightResult.dist ? leftResult.pair : rightResult.pair;

    steps.push({
      type: 'CONQUER_HALVES',
      message: `CONQUISTAR (Nível ${depth}): Menor distância entre metades: δ = ${d.toFixed(1)}px`,
      data: {
        splitX: midPoint.x,
        delta: d,
        currentBest: bestPair,
        currentPair: bestPair,
        depth,
        operationsCount: comparisons
      }
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
      message: `COMBINAR (Nível ${depth}): Verificando ${strip.length} pontos na faixa central [X ± ${d.toFixed(0)}px] ordenados por Y.`,
      data: {
        splitX: midPoint.x,
        delta: d,
        strip,
        subset: strip,
        depth,
        operationsCount: comparisons
      }
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
            data: {
              pair: bestPair,
              currentPair: bestPair,
              dist: d,
              splitX: midPoint.x,
              delta: d,
              depth,
              operationsCount: comparisons
            }
          });
        }
      }
    }

    return { dist: d, pair: bestPair };
  }

  const result = closestPairRec(ptsSortedX, 0);

  steps.push({
    type: 'COMPLETED',
    message: `ALGORITMO D&C CONCLUÍDO! Par Crítico detectado: Distância = ${result.dist.toFixed(1)}px com apenas ${comparisons} comparações (vs Força Bruta ${bruteForceOps}).`,
    data: {
      finalPair: result.pair,
      finalDist: result.dist,
      comparisons,
      operationsCount: comparisons,
      bruteForceOps,
      maxDepth,
      isBruteForce: false
    }
  });

  return {
    minDist: result.dist,
    pair: result.pair,
    comparisons,
    operationsCount: comparisons,
    bruteForceOps,
    maxDepth,
    steps,
  };
}
