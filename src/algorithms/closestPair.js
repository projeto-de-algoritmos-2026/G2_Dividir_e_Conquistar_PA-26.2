// Divide & Conquer: Closest Pair of Points in 2D
// Time Complexity: O(n log n) compared to Brute Force O(n^2)

export function distance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function bruteForceClosestPair(points) {
  let minDist = Infinity;
  let pair = null;
  let comparisons = 0;

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      comparisons++;
      const d = distance(points[i], points[j]);
      if (d < minDist) {
        minDist = d;
        pair = [points[i], points[j]];
      }
    }
  }

  return { minDist, pair, comparisons };
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

    // Base Case: 2 or 3 points -> Brute Force
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
    message: `ALGORITMO CONCLUÍDO! Par Crítico detectado: Distância = ${result.dist.toFixed(1)}px com apenas ${comparisons} comparações (vs Brute Force ${Math.round(points.length * (points.length - 1) / 2)}).`,
    data: { finalPair: result.pair, finalDist: result.dist, comparisons }
  });

  return {
    minDist: result.dist,
    pair: result.pair,
    comparisons,
    steps,
  };
}

