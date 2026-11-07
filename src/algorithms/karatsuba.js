// Divide & Conquer: Karatsuba Fast Multiplication
// Time Complexity: O(n^log2(3)) ≈ O(n^1.585) vs Grade-School O(n^2)
// Reduces 4 multiplications to 3 recursive multiplications:
// X = 10^(m) * A + B
// Y = 10^(m) * C + D
// XY = 10^(2m)*AC + 10^m*((A+B)(C+D) - AC - BD) + BD

export function solveKaratsubaDC(numX, numY) {
  const steps = [];
  let multiplicationsCount = 0;

  const strX = String(numX);
  const strY = String(numY);

  steps.push({
    type: 'INIT',
    message: `[CANHÃO DE CERCO KARATSUBA] Multiplicando números de mana colossais: ${strX} × ${strY}.`,
    data: { x: numX, y: numY }
  });

  function karatsubaRec(x, y, depth = 0) {
    const sX = String(x);
    const sY = String(y);
    const n = Math.max(sX.length, sY.length);

    // Base Case: Single digit multiplication
    if (n <= 1) {
      multiplicationsCount++;
      const prod = BigInt(x) * BigInt(y);
      steps.push({
        type: 'BASE_CASE',
        message: `Caso Base (Nível ${depth}): Multiplicação elementar direta ${x} × ${y} = ${prod}.`,
        data: { x, y, product: Number(prod) }
      });
      return BigInt(prod);
    }

    // DIVIDE: Split both numbers into two halves
    const m = Math.floor(n / 2);
    const padX = sX.padStart(n, '0');
    const padY = sY.padStart(n, '0');

    const highX = BigInt(padX.slice(0, padX.length - m) || '0');
    const lowX = BigInt(padX.slice(padX.length - m) || '0');
    const highY = BigInt(padY.slice(padY.length - m) || '0');
    const lowY = BigInt(padY.slice(padY.length - m) || '0');

    steps.push({
      type: 'DIVIDE',
      message: `DIVIDIR (Nível ${depth}): Fatiando em metades (m=${m}). X: A=${highX}, B=${lowX} | Y: C=${highY}, D=${lowY}.`,
      data: { highX: Number(highX), lowX: Number(lowX), highY: Number(highY), lowY: Number(lowY), m }
    });

    // CONQUER: 3 Recursive multiplications instead of 4!
    // z0 = lowX * lowY (BD)
    const z0 = karatsubaRec(Number(lowX), Number(lowY), depth + 1);

    // z2 = highX * highY (AC)
    const z2 = karatsubaRec(Number(highX), Number(highY), depth + 1);

    // z1 = (highX + lowX) * (highY + lowY) - z2 - z0
    const sumX = highX + lowX;
    const sumY = highY + lowY;
    const z1Intermediate = karatsubaRec(Number(sumX), Number(sumY), depth + 1);
    const z1 = z1Intermediate - z2 - z0;

    // COMBINE: Result = z2 * 10^(2m) + z1 * 10^(m) + z0
    const power10_m = 10n ** BigInt(m);
    const power10_2m = 10n ** BigInt(2 * m);
    const result = (z2 * power10_2m) + (z1 * power10_m) + z0;

    steps.push({
      type: 'COMBINE_KARATSUBA',
      message: `COMBINAR (Nível ${depth}): z0(BD)=${z0}, z2(AC)=${z2}, z1(Gauss)=${z1} => Resultado parcial: ${result}.`,
      data: { z0: Number(z0), z1: Number(z1), z2: Number(z2), result: Number(result) }
    });

    return result;
  }

  const finalResult = karatsubaRec(numX, numY);

  const gradeSchoolMults = strX.length * strY.length;
  steps.push({
    type: 'COMPLETED',
    message: `[KARATSUBA COMPLETO] ${numX} × ${numY} = ${finalResult}! Calculado com apenas 3 multiplicações recursivas por divisão (Complexidade O(n^1.585) vs Escola ${gradeSchoolMults} ops).`,
    data: {
      finalProduct: finalResult.toString(),
      multiplicationsCount,
      gradeSchoolMults,
      numX,
      numY,
    }
  });

  return {
    product: finalResult.toString(),
    multiplicationsCount,
    gradeSchoolMults,
    steps,
  };
}

