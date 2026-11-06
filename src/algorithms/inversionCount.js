// Divide & Conquer: Counting Inversions using Modified Merge Sort
// Time Complexity: O(n log n) with T(n) = 2T(n/2) + O(n)
// Measures the chaos/disorder level of the boss runes.

export function solveInversionsDC(originalArray) {
  const steps = [];
  let totalInversions = 0;

  steps.push({
    type: 'INIT',
    message: `Iniciando Verificação de Entropia com ${originalArray.length} runas elementais: [${originalArray.join(', ')}].`,
    data: { array: [...originalArray] }
  });

  function countInversionsRec(arr, depth = 0) {
    const n = arr.length;

    // Base Case: Array with 1 or 0 elements has 0 inversions and is already sorted
    if (n <= 1) {
      return { sorted: arr, inversions: 0 };
    }

    // DIVIDE: Split array into left and right halves
    const mid = Math.floor(n / 2);
    const left = arr.slice(0, mid);
    const right = arr.slice(mid);

    steps.push({
      type: 'DIVIDE',
      message: `DIVIDIR (Nível ${depth}): Subdividindo runas [${arr.join(', ')}] em Esquerda [${left.join(', ')}] e Direita [${right.join(', ')}].`,
      data: { left, right, depth }
    });

    // CONQUER: Recursively count inversions in both halves
    const leftResult = countInversionsRec(left, depth + 1);
    const rightResult = countInversionsRec(right, depth + 1);

    // COMBINE: Count split inversions during the merge step
    const mergeResult = mergeAndCount(leftResult.sorted, rightResult.sorted, depth);

    const subTotal = leftResult.inversions + rightResult.inversions + mergeResult.inversions;

    steps.push({
      type: 'MERGE_STEP',
      message: `CONQUISTAR/MERGE (Nível ${depth}): Mesclado [${mergeResult.sorted.join(', ')}] com +${mergeResult.inversions} inversões cruzadas.`,
      data: {
        merged: mergeResult.sorted,
        subInversions: subTotal,
        inversionPairs: mergeResult.pairs
      }
    });

    return {
      sorted: mergeResult.sorted,
      inversions: subTotal,
    };
  }

  function mergeAndCount(left, right, depth) {
    const sorted = [];
    let i = 0;
    let j = 0;
    let invCount = 0;
    const pairs = [];

    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) {
        sorted.push(left[i]);
        i++;
      } else {
        // Since left is sorted, if left[i] > right[j],
        // then right[j] is smaller than all elements left[i...left.length - 1]
        sorted.push(right[j]);
        const count = left.length - i;
        invCount += count;

        for (let k = i; k < left.length; k++) {
          pairs.push([left[k], right[j]]);
        }

        steps.push({
          type: 'INVERSION_FOUND',
          message: `⚡ MALDIÇÃO DETECTADA: Runa ${right[j]} &lt; Runa ${left[i]}! Gera ${count} inversões com [${left.slice(i).join(', ')}].`,
          data: { leftItem: left[i], rightItem: right[j], countAdded: count }
        });

        j++;
      }
    }

    // Append remaining elements
    while (i < left.length) {
      sorted.push(left[i]);
      i++;
    }
    while (j < right.length) {
      sorted.push(right[j]);
      j++;
    }

    return { sorted, inversions: invCount, pairs };
  }

  const finalResult = countInversionsRec([...originalArray]);
  totalInversions = finalResult.inversions;

  steps.push({
    type: 'COMPLETED',
    message: `PURIFICAÇÃO COMPLETA! Total de ${totalInversions} inversões de caos corrigidas. Runas alinhadas em harmonia: [${finalResult.sorted.join(', ')}].`,
    data: {
      finalSorted: finalResult.sorted,
      totalInversions,
    }
  });

  return {
    sorted: finalResult.sorted,
    inversions: totalInversions,
    steps,
  };
}

