// Divide & Conquer: QuickSelect (Linear Selection Algorithm)
// Average Time Complexity: O(n) vs O(n log n) sorting
// Selects the k-th smallest element using partition and subproblem pruning.

export function solveQuickSelectDC(monstersList, kTarget) {
  const steps = [];
  const monsters = monstersList.map((m) => ({ ...m, eliminated: false }));
  const k = kTarget - 1; // 0-based index

  steps.push({
    type: 'INIT',
    message: `Iniciando Sniper QuickSelect para isolar o ${kTarget}º monstro mais forte (k=${kTarget}) sem ordenar toda a tropa.`,
    data: { monsters: [...monsters], kTarget }
  });

  function quickSelectRec(arr, left, right, iteration = 1) {
    if (left === right) {
      steps.push({
        type: 'TARGET_FOUND',
        message: `🎯 ALVO ISOLADO! O monstro ${arr[left].id} (Poder ${arr[left].power}) é exatamente o ${kTarget}º alvo!`,
        data: { target: arr[left], index: left }
      });
      return arr[left];
    }

    // DIVIDE: Partition around pivot
    const pivotIdx = partition(arr, left, right, iteration);

    steps.push({
      type: 'PARTITION_DONE',
      message: `PARTIÇÃO CONCLUÍDA: Pivô [Poder ${arr[pivotIdx].power}] alocado no slot ordenado #${pivotIdx + 1}.`,
      data: { pivotIdx, pivot: arr[pivotIdx], left, right }
    });

    // CONQUER / PRUNE: Choose which side to recurse into
    if (pivotIdx === k) {
      steps.push({
        type: 'TARGET_FOUND',
        message: `👑 ALVO ENCONTRADO NO PIVÔ! O monstro ${arr[pivotIdx].id} (Poder ${arr[pivotIdx].power}) é o ${kTarget}º requisitado!`,
        data: { target: arr[pivotIdx], index: pivotIdx }
      });
      return arr[pivotIdx];
    } else if (k < pivotIdx) {
      // Eliminate right half
      for (let i = pivotIdx + 1; i <= right; i++) {
        arr[i].eliminated = true;
      }
      steps.push({
        type: 'PRUNE_RIGHT',
        message: `DESCARTAR DIREITA: Como k=${kTarget} &lt; posição ${pivotIdx + 1}, eliminamos ${right - pivotIdx} monstros mais fortes. Recorrendo apenas na metade esquerda.`,
        data: { left, right: pivotIdx - 1 }
      });
      return quickSelectRec(arr, left, pivotIdx - 1, iteration + 1);
    } else {
      // Eliminate left half
      for (let i = left; i < pivotIdx; i++) {
        arr[i].eliminated = true;
      }
      steps.push({
        type: 'PRUNE_LEFT',
        message: `DESCARTAR ESQUERDA: Como k=${kTarget} &gt; posição ${pivotIdx + 1}, eliminamos ${pivotIdx - left} monstros mais fracos. Recorrendo apenas na metade direita.`,
        data: { left: pivotIdx + 1, right }
      });
      return quickSelectRec(arr, pivotIdx + 1, right, iteration + 1);
    }
  }

  function partition(arr, left, right, iteration) {
    const pivot = arr[right];
    let i = left;

    steps.push({
      type: 'CHOOSE_PIVOT',
      message: `RODADA ${iteration}: Pivô escolhido = Monstro #${arr[right].id} (Poder ${arr[right].power}). Comparando elementos no intervalo [${left + 1} a ${right + 1}].`,
      data: { pivot, left, right }
    });

    for (let j = left; j < right; j++) {
      if (arr[j].power <= pivot.power) {
        // Swap arr[i] and arr[j]
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
        i++;
      }
    }

    // Place pivot at its final correct sorted position
    const temp = arr[i];
    arr[i] = arr[right];
    arr[right] = temp;

    return i;
  }

  const target = quickSelectRec(monsters, 0, monsters.length - 1);

  steps.push({
    type: 'COMPLETED',
    message: `MISSÃO CUMPRIDA! Campeão isolado com poder ${target.power}. Complexidade média de execução: O(n)!`,
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

