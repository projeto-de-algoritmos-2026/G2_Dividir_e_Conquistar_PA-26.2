// Divide & Conquer: Karatsuba Fast Multiplication
// Time Complexity: O(n^log2(3)) ≈ O(n^1.585) vs Grade-School O(n^2)
// Reduces 4 multiplications to 3 recursive multiplications:
// X = 10^(m) * A + B
// Y = 10^(m) * C + D
// XY = 10^(2m)*AC + 10^m*((A+B)(C+D) - AC - BD) + BD

export function solveKaratsubaBruteForce(numX, numY) {
  const steps = [];
  const strX = String(numX);
  const strY = String(numY);
  const digitsX = strX.split('').map(Number).reverse();
  const digitsY = strY.split('').map(Number).reverse();

  let operationsCount = 0;
  let runningTotal = 0n;

  steps.push({
    type: 'BRUTE_INIT',
    message: `[FORÇA BRUTA O(n²)] Multiplicação escolar dígito a dígito: ${strX} × ${strY} (${strX.length * strY.length} produtos parciais).`,
    data: {
      x: numX,
      y: numY,
      depth: 0,
      operationsCount: 0,
      isBruteForce: true,
    },
  });

  for (let j = 0; j < digitsY.length; j++) {
    let rowSum = 0n;
    const dY = digitsY[j];
    for (let i = 0; i < digitsX.length; i++) {
      operationsCount++;
      const dX = digitsX[i];
      const elemProd = dX * dY;
      const shiftedValue = BigInt(elemProd) * (10n ** BigInt(i + j));
      rowSum += shiftedValue;

      steps.push({
        type: 'BRUTE_CHECK',
        message: `Produto elementar #${operationsCount}: dígito ${dX} (10^${i}) × dígito ${dY} (10^${j}) = ${elemProd} → +${shiftedValue.toString()}`,
        data: {
          x: numX,
          y: numY,
          dX,
          dY,
          i,
          j,
          elemProd,
          operationsCount,
          depth: 1,
          isBruteForce: true,
        },
      });
    }
    runningTotal += rowSum;
  }

  steps.push({
    type: 'COMPLETED',
    message: `[FORÇA BRUTA CONCLUÍDA] ${numX} × ${numY} = ${runningTotal.toString()} após ${operationsCount} multiplicações dígito a dígito em O(n²).`,
    data: {
      finalProduct: runningTotal.toString(),
      multiplicationsCount: operationsCount,
      operationsCount,
      gradeSchoolMults: operationsCount,
      maxDepth: 1,
      numX,
      numY,
      isBruteForce: true,
    },
  });

  return {
    product: runningTotal.toString(),
    multiplicationsCount: operationsCount,
    operationsCount,
    gradeSchoolMults: operationsCount,
    maxDepth: 1,
    steps,
  };
}

export function solveKaratsubaDC(numX, numY) {
  const steps = [];
  let multiplicationsCount = 0;
  let maxDepth = 0;

  const strX = String(numX);
  const strY = String(numY);

  steps.push({
    type: 'INIT',
    message: `[CANHÃO DE CERCO KARATSUBA] Multiplicando números de mana colossais: ${strX} × ${strY}.`,
    data: { x: numX, y: numY, depth: 0, operationsCount: 0 }
  });

  function karatsubaRec(x, y, depth = 0, branch = 'ROOT') {
    if (depth > maxDepth) maxDepth = depth;
    const sX = String(x);
    const sY = String(y);
    const n = Math.max(sX.length, sY.length);

    // Base Case: Single digit multiplication
    if (n <= 1) {
      multiplicationsCount++;
      const prod = BigInt(x) * BigInt(y);
      steps.push({
        type: 'BASE_CASE',
        message: `Caso Base (Nível ${depth} • ${branch}): Multiplicação direta ${x} × ${y} = ${prod}.`,
        data: {
          x,
          y,
          product: Number(prod),
          depth,
          branch,
          operationsCount: multiplicationsCount,
        }
      });
      return BigInt(prod);
    }

    // DIVIDE: Split both numbers into two halves
    const m = Math.floor(n / 2);
    const padX = sX.padStart(n, '0');
    const padY = sY.padStart(n, '0');

    const highX = BigInt(padX.slice(0, padX.length - m) || '0');
    const lowX = BigInt(padX.slice(padX.length - m) || '0');
    const highY = BigInt(padY.slice(0, padY.length - m) || '0');
    const lowY = BigInt(padY.slice(padY.length - m) || '0');

    steps.push({
      type: 'DIVIDE',
      message: `DIVIDIR (Nível ${depth} • ${branch}): Fatiando (m=${m}) → A=${highX}, B=${lowX} | C=${highY}, D=${lowY}.`,
      data: {
        highX: Number(highX),
        lowX: Number(lowX),
        highY: Number(highY),
        lowY: Number(lowY),
        m,
        depth,
        branch,
        operationsCount: multiplicationsCount,
      }
    });

    // CONQUER: 3 Recursive multiplications instead of 4!
    // z0 = lowX * lowY (BD)
    const z0 = karatsubaRec(Number(lowX), Number(lowY), depth + 1, 'z0 (B×D)');

    // z2 = highX * highY (AC)
    const z2 = karatsubaRec(Number(highX), Number(highY), depth + 1, 'z2 (A×C)');

    // z1 = (highX + lowX) * (highY + lowY) - z2 - z0
    const sumX = highX + lowX;
    const sumY = highY + lowY;
    const z1Intermediate = karatsubaRec(Number(sumX), Number(sumY), depth + 1, 'z1 (A+B)(C+D)');
    const z1 = z1Intermediate - z2 - z0;

    // COMBINE: Result = z2 * 10^(2m) + z1 * 10^(m) + z0
    const power10_m = 10n ** BigInt(m);
    const power10_2m = 10n ** BigInt(2 * m);
    const result = (z2 * power10_2m) + (z1 * power10_m) + z0;

    steps.push({
      type: 'COMBINE_KARATSUBA',
      message: `COMBINAR (Nível ${depth} • ${branch}): z2=${z2}, z1=${z1}, z0=${z0} => Parcial: ${result}.`,
      data: {
        highX: Number(highX),
        lowX: Number(lowX),
        highY: Number(highY),
        lowY: Number(lowY),
        z0: Number(z0),
        z1: Number(z1),
        z2: Number(z2),
        result: Number(result),
        depth,
        branch,
        operationsCount: multiplicationsCount,
      }
    });

    return result;
  }

  const finalResult = karatsubaRec(numX, numY, 0, 'RAIZ');

  const nDigits = Math.max(strX.length, strY.length);
  const gradeSchoolMults = nDigits * nDigits;
  // Classic 4-multiplication D&C would do 4^ceil(log2(n)) base multiplications
  const naiveRecMults = Math.pow(4, Math.ceil(Math.log2(Math.max(2, nDigits))));

  steps.push({
    type: 'COMPLETED',
    message: `[KARATSUBA COMPLETO] ${numX} × ${numY} = ${finalResult}! Apenas ${multiplicationsCount} casos base (3 ramos/nível em O(n^1.585) vs ${naiveRecMults} na recursão 4-ramos O(n²)).`,
    data: {
      finalProduct: finalResult.toString(),
      multiplicationsCount,
      operationsCount: multiplicationsCount,
      gradeSchoolMults: Math.max(gradeSchoolMults, naiveRecMults),
      maxDepth,
      numX,
      numY,
      isBruteForce: false,
    }
  });

  return {
    product: finalResult.toString(),
    multiplicationsCount,
    operationsCount: multiplicationsCount,
    gradeSchoolMults: Math.max(gradeSchoolMults, naiveRecMults),
    maxDepth,
    steps,
  };
}
