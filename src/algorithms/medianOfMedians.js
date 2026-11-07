// Divide & Conquer: Median of Medians (BFPRT Algorithm)
// Time Complexity: O(n) STRICT DETERMINISTIC WORST-CASE!
// Recurrence: T(n) <= T(n/5) + T(7n/10) + O(n) => O(n)

export function solveMedianOfMediansDC(monstersList, kTarget) {
  const steps = [];
  const monsters = monstersList.map((m) => ({ ...m, eliminated: false }));
  const k = kTarget - 1; // 0-based

  steps.push({
    type: 'INIT',
    message: `[MEDIANA DAS MEDIANAS (BFPRT)] Buscando o ${kTarget}º alvo com pivô determinístico ótimo garantido em O(n).`,
    data: { monsters: [...monsters], kTarget }
  });

  // Find median of medians to use as pivot
  function getMedianOfMediansPivot(arr, depth = 0) {
    const n = arr.length;
    if (n <= 5) {
      const sortedSmall = [...arr].sort((a, b) => a.power - b.power);
      const mid = Math.floor(sortedSmall.length / 2);
      steps.push({
        type: 'LOCAL_MEDIAN',
        message: `Caso Base Subgrupo (tam ${n}): Mediana = #${sortedSmall[mid].id} (Poder ${sortedSmall[mid].power}).`,
        data: { subGroup: sortedSmall, median: sortedSmall[mid] }
      });
      return sortedSmall[mid];
    }

    // Step 1: Divide into groups of 5
    const groups = [];
    const medians = [];

    for (let i = 0; i < n; i += 5) {
      const group = arr.slice(i, i + 5);
      groups.push(group);
      const sortedGroup = [...group].sort((a, b) => a.power - b.power);
      const med = sortedGroup[Math.floor(sortedGroup.length / 2)];
      medians.push(med);
    }

    steps.push({
      type: 'GROUPS_OF_FIVE',
      message: `DIVIDIR EM BLOCOS DE 5: ${n} monstros divididos em ${groups.length} grupos. Medianas extraídas: [${medians.map(m => m.power).join(', ')}].`,
      data: { groups, medians, depth }
    });

    // Step 2: Recursively find median of the medians
    const mom = getMedianOfMediansPivot(medians, depth + 1);

    steps.push({
      type: 'MOM_CHOSEN',
      message: `👑 PIVÔ PERFEITO SELECIONADO: Mediana das Medianas = Monstro #${mom.id} (Poder ${mom.power}). Garante no mínimo 30% de poda!`,
      data: { pivot: mom }
    });

    return mom;
  }

  function selectRec(arr, left, right, targetIdx, iteration = 1) {
    if (left === right) {
      steps.push({
        type: 'TARGET_FOUND',
        message: `🎯 ALVO FINAL ISOLADO! O monstro #${arr[left].id} (Poder ${arr[left].power}) é exatamente o ${kTarget}º procurado!`,
        data: { target: arr[left], index: left }
      });
      return arr[left];
    }

    const currentSub = arr.slice(left, right + 1);
    const pivotObj = getMedianOfMediansPivot(currentSub);

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
      data: { pivotIdx: actualPivotIdx, pivot: arr[actualPivotIdx], left, right }
    });

    if (actualPivotIdx === targetIdx) {
      steps.push({
        type: 'TARGET_FOUND',
        message: `👑 ALVO ENCONTRADO NO PIVÔ! Monstro #${arr[actualPivotIdx].id} (Poder ${arr[actualPivotIdx].power}) é o ${kTarget}º alvo!`,
        data: { target: arr[actualPivotIdx], index: actualPivotIdx }
      });
      return arr[actualPivotIdx];
    } else if (targetIdx < actualPivotIdx) {
      // Eliminate right half
      for (let idx = actualPivotIdx + 1; idx <= right; idx++) {
        arr[idx].eliminated = true;
      }
      steps.push({
        type: 'PRUNE_RIGHT',
        message: `PODA GARANTIDA: k=${kTarget} < posição ${actualPivotIdx + 1}. Descartando ${right - actualPivotIdx} monstros mais fortes.`,
        data: { left, right: actualPivotIdx - 1 }
      });
      return selectRec(arr, left, actualPivotIdx - 1, targetIdx, iteration + 1);
    } else {
      // Eliminate left half
      for (let idx = left; idx < actualPivotIdx; idx++) {
        arr[idx].eliminated = true;
      }
      steps.push({
        type: 'PRUNE_LEFT',
        message: `PODA GARANTIDA: k=${kTarget} > posição ${actualPivotIdx + 1}. Descartando ${actualPivotIdx - left} monstros mais fracos.`,
        data: { left: actualPivotIdx + 1, right }
      });
      return selectRec(arr, actualPivotIdx + 1, right, targetIdx, iteration + 1);
    }
  }

  const target = selectRec(monsters, 0, monsters.length - 1, k);

  steps.push({
    type: 'COMPLETED',
    message: `[MEDIANA DAS MEDIANAS CONCLUÍDO] Alvo de precisão isolado com poder ${target.power}! Complexidade rigorosamente O(n) no pior caso.`,
    data: {
      finalTarget: target,
      monsters,
    }
  });

  return {
    target,
    monsters,
    steps,
  };
}

