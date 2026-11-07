// Divide & Conquer: Median of Medians (BFPRT Algorithm)
// Time Complexity: O(n) STRICT DETERMINISTIC WORST-CASE!
// Recurrence: T(n) <= T(n/5) + T(7n/10) + O(n) => O(n)

export function solveMedianBruteForce(monstersList, kTarget) {
  const steps = [];
  const monsters = monstersList.map((m) => ({ ...m, eliminated: false }));
  const n = monsters.length;
  const k = Math.max(0, Math.min(n - 1, kTarget - 1));
  let comparisons = 0;

  steps.push({
    type: 'BRUTE_INIT',
    message: `[FORÇA BRUTA / SELEÇÃO QUADRÁTICA O(n²)] Ordenando/comparando toda a tropa par a par para encontrar o ${kTarget}º alvo.`,
    data: {
      monsters: monsters.map((m) => ({ ...m })),
      kTarget,
      operationsCount: 0,
      depth: 0,
      isBruteForce: true,
    },
  });

  // Quadratic Selection / Degenerate Partition O(n^2):
  // In each pass i, scans remaining elements and compares pairwise
  for (let i = 0; i < n; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      comparisons++;
      if (monsters[j].power < monsters[minIdx].power) {
        minIdx = j;
      }
      steps.push({
        type: 'BRUTE_CHECK',
        message: `Comparação #${comparisons}: Monstro #${monsters[minIdx].id} (P:${monsters[minIdx].power}) vs #${monsters[j].id} (P:${monsters[j].power}).`,
        data: {
          monsters: monsters.map((m) => ({ ...m })),
          comparing: [monsters[minIdx], monsters[j]],
          left: i,
          right: n - 1,
          operationsCount: comparisons,
          depth: i + 1,
          isBruteForce: true,
        },
      });
    }

    if (minIdx !== i) {
      const tmp = monsters[i];
      monsters[i] = monsters[minIdx];
      monsters[minIdx] = tmp;
    }

    if (i !== k) {
      monsters[i].eliminated = true;
    }
  }

  const target = monsters[k];
  monsters.forEach((m, idx) => {
    m.eliminated = idx !== k;
  });

  steps.push({
    type: 'COMPLETED',
    message: `[FORÇA BRUTA CONCLUÍDA] Alvo #${target.id} (Poder ${target.power}) encontrado após ${comparisons} comparações quadráticas O(n²) sem poda BFPRT.`,
    data: {
      finalTarget: target,
      monsters: monsters.map((m) => ({ ...m })),
      operationsCount: comparisons,
      bruteForceOps: comparisons,
      maxDepth: n,
      isBruteForce: true,
    },
  });

  return {
    target,
    monsters,
    operationsCount: comparisons,
    bruteForceOps: comparisons,
    maxDepth: n,
    steps,
  };
}

export function solveMedianOfMediansDC(monstersList, kTarget) {
  const steps = [];
  const monsters = monstersList.map((m) => ({ ...m, eliminated: false }));
  const nTotal = monsters.length;
  const k = Math.max(0, Math.min(nTotal - 1, kTarget - 1)); // 0-based
  let operationsCount = 0;
  let maxDepth = 0;

  steps.push({
    type: 'INIT',
    message: `[MEDIANA DAS MEDIANAS (BFPRT)] Buscando o ${kTarget}º alvo com pivô determinístico ótimo garantido em O(n).`,
    data: {
      monsters: monsters.map((m) => ({ ...m })),
      kTarget,
      left: 0,
      right: nTotal - 1,
      operationsCount: 0,
      depth: 0,
    }
  });

  // Find median of medians to use as pivot
  function getMedianOfMediansPivot(arr, depth = 0, rangeLeft = 0, rangeRight = nTotal - 1) {
    if (depth > maxDepth) maxDepth = depth;
    const n = arr.length;
    if (n <= 5) {
      operationsCount += Math.max(1, n - 1);
      const sortedSmall = [...arr].sort((a, b) => a.power - b.power);
      const mid = Math.floor(sortedSmall.length / 2);
      steps.push({
        type: 'LOCAL_MEDIAN',
        message: `Caso Base Subgrupo (tam ${n}): Mediana = #${sortedSmall[mid].id} (Poder ${sortedSmall[mid].power}).`,
        data: {
          subGroup: sortedSmall,
          median: sortedSmall[mid],
          medians: [sortedSmall[mid]],
          left: rangeLeft,
          right: rangeRight,
          depth,
          operationsCount,
        }
      });
      return sortedSmall[mid];
    }

    // Step 1: Divide into groups of 5
    const groups = [];
    const medians = [];

    for (let i = 0; i < n; i += 5) {
      const group = arr.slice(i, i + 5);
      groups.push(group);
      operationsCount += Math.max(1, group.length - 1);
      const sortedGroup = [...group].sort((a, b) => a.power - b.power);
      const med = sortedGroup[Math.floor(sortedGroup.length / 2)];
      medians.push(med);
    }

    steps.push({
      type: 'GROUPS_OF_FIVE',
      message: `DIVIDIR EM BLOCOS DE 5: ${n} monstros divididos em ${groups.length} grupos. Medianas extraídas: [${medians.map(m => m.power).join(', ')}].`,
      data: {
        groups,
        medians,
        left: rangeLeft,
        right: rangeRight,
        depth,
        operationsCount,
      }
    });

    // Step 2: Recursively find median of the medians
    const mom = getMedianOfMediansPivot(medians, depth + 1, rangeLeft, rangeRight);

    steps.push({
      type: 'MOM_CHOSEN',
      message: `👑 PIVÔ PERFEITO SELECIONADO: Mediana das Medianas = Monstro #${mom.id} (Poder ${mom.power}). Garante no mínimo 30% de poda!`,
      data: {
        pivot: mom,
        medians,
        left: rangeLeft,
        right: rangeRight,
        depth,
        operationsCount,
      }
    });

    return mom;
  }

  function selectRec(arr, left, right, targetIdx, iteration = 1) {
    if (iteration > maxDepth) maxDepth = iteration;

    if (left === right) {
      steps.push({
        type: 'TARGET_FOUND',
        message: `🎯 ALVO FINAL ISOLADO! O monstro #${arr[left].id} (Poder ${arr[left].power}) é exatamente o ${kTarget}º procurado!`,
        data: {
          target: arr[left],
          index: left,
          left,
          right,
          depth: iteration,
          operationsCount,
        }
      });
      return arr[left];
    }

    const currentSub = arr.slice(left, right + 1);
    const pivotObj = getMedianOfMediansPivot(currentSub, iteration, left, right);

    // Find pivot index in arr
    let pivotIndexInArr = left;
    for (let i = left; i <= right; i++) {
      if (arr[i].id === pivotObj.id) {
        pivotIndexInArr = i;
        break;
      }
    }

    // Swap pivot to the end
    const tempEnd = arr[pivotIndexInArr];
    arr[pivotIndexInArr] = arr[right];
    arr[right] = tempEnd;

    // Partition
    const pivotPower = arr[right].power;
    let i = left;

    for (let j = left; j < right; j++) {
      operationsCount++;
      if (arr[j].power <= pivotPower) {
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
        i++;
      }
    }

    const swapFinal = arr[i];
    arr[i] = arr[right];
    arr[right] = swapFinal;

    const actualPivotIdx = i;

    steps.push({
      type: 'PARTITION_DONE',
      message: `PARTIÇÃO CONCLUÍDA: Pivô [Poder ${arr[actualPivotIdx].power}] alocado no slot ordenado #${actualPivotIdx + 1}.`,
      data: {
        pivotIdx: actualPivotIdx,
        pivot: arr[actualPivotIdx],
        monsters: arr.map((m) => ({ ...m })),
        left,
        right,
        depth: iteration,
        operationsCount,
      }
    });

    if (actualPivotIdx === targetIdx) {
      for (let idx = 0; idx < arr.length; idx++) {
        if (idx !== actualPivotIdx) arr[idx].eliminated = true;
      }
      steps.push({
        type: 'TARGET_FOUND',
        message: `👑 ALVO ENCONTRADO NO PIVÔ! Monstro #${arr[actualPivotIdx].id} (Poder ${arr[actualPivotIdx].power}) é o ${kTarget}º alvo!`,
        data: {
          target: arr[actualPivotIdx],
          index: actualPivotIdx,
          left,
          right,
          depth: iteration,
          operationsCount,
        }
      });
      return arr[actualPivotIdx];
    } else if (targetIdx < actualPivotIdx) {
      // Eliminate right half
      for (let idx = actualPivotIdx; idx <= right; idx++) {
        arr[idx].eliminated = true;
      }
      steps.push({
        type: 'PRUNE_RIGHT',
        message: `PODA GARANTIDA: k=${kTarget} < posição ${actualPivotIdx + 1}. Descartando ${right - actualPivotIdx + 1} monstros à direita.`,
        data: {
          left,
          right: actualPivotIdx - 1,
          prunedFrom: actualPivotIdx,
          prunedTo: right,
          monsters: arr.map((m) => ({ ...m })),
          depth: iteration,
          operationsCount,
        }
      });
      return selectRec(arr, left, actualPivotIdx - 1, targetIdx, iteration + 1);
    } else {
      // Eliminate left half
      for (let idx = left; idx <= actualPivotIdx; idx++) {
        arr[idx].eliminated = true;
      }
      steps.push({
        type: 'PRUNE_LEFT',
        message: `PODA GARANTIDA: k=${kTarget} > posição ${actualPivotIdx + 1}. Descartando ${actualPivotIdx - left + 1} monstros à esquerda.`,
        data: {
          left: actualPivotIdx + 1,
          right,
          prunedFrom: left,
          prunedTo: actualPivotIdx,
          monsters: arr.map((m) => ({ ...m })),
          depth: iteration,
          operationsCount,
        }
      });
      return selectRec(arr, actualPivotIdx + 1, right, targetIdx, iteration + 1);
    }
  }

  const target = selectRec(monsters, 0, monsters.length - 1, k, 1);
  const bruteForceOps = Math.round((nTotal * (nTotal - 1)) / 2);

  steps.push({
    type: 'COMPLETED',
    message: `[MEDIANA DAS MEDIANAS CONCLUÍDO] Alvo #${target.id} (Poder ${target.power}) isolado em ${operationsCount} operações lineares (vs ${bruteForceOps} em O(n²))!`,
    data: {
      finalTarget: target,
      monsters: monsters.map((m) => ({ ...m })),
      operationsCount,
      bruteForceOps,
      maxDepth,
      isBruteForce: false,
    }
  });

  return {
    target,
    monsters,
    operationsCount,
    bruteForceOps,
    maxDepth,
    steps,
  };
}
