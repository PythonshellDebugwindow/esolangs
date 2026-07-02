class NativeFloat {
  constructor(value) {
    this.value = value;
  }

  static fromLiteral(value, sign) {
    return new NativeFloat(parseFloat(value) * sign);
  }

  toString() {
    return this.value.toString();
  }

  add(other) {
    return new NativeFloat(this.value + other.value);
  }

  subtract(other) {
    return new NativeFloat(this.value - other.value);
  }

  multiply(other) {
    return new NativeFloat(this.value * other.value);
  }

  divide(other) {
    return new NativeFloat(this.value / other.value);
  }

  negate() {
    return new NativeFloat(-this.value);
  }

  isZero() {
    return this.value === 0;
  }
}

class Rational {
  static #maxFractionalDigits = 15;

  constructor(dividend, divisor, sign) {
    this.dividend = dividend;
    this.divisor = divisor;
    this.sign = sign;
    this.#simplify();
  }

  static fromLiteral(value, sign) {
    const decimalPointIndex = value.indexOf(".");
    if(decimalPointIndex < 0) {
      return new Rational(BigInt(value), 1n, BigInt(sign));
    }
    const numDecimalDigits = value.length - decimalPointIndex - 1;
    return new Rational(BigInt(value.replace(".", "")), 10n ** BigInt(numDecimalDigits), BigInt(sign));
  }

  toString() {
    const sign = this.sign === -1n ? "-" : "";
    if(this.divisor === 1n) {
      return sign + this.dividend;
    }

    let additionalDigits = Rational.#maxFractionalDigits;
    if(this.dividend < this.divisor) {
      additionalDigits += (this.divisor / this.dividend).toString().length;
    }
    let quotient = this.dividend * 10n ** BigInt(additionalDigits + 1) / this.divisor;
    if(quotient % 10n >= 5n) {
      quotient += 10n;
    }
    let result = (quotient / 10n).toString();
    const hasRemainder = this.dividend * 10n ** BigInt(additionalDigits) % this.divisor !== 0n;
    if(this.dividend > this.divisor) {
      const decimalPointPosition = result.length - Rational.#maxFractionalDigits;
      result = result.substring(0, decimalPointPosition) + "." + result.substring(decimalPointPosition);
      if(!hasRemainder && /0+$/.test(result)) {
        result = result.replace(/0+$/, "");
      }
      return sign + result;
    } else {
      const leadingZeros = (this.divisor / this.dividend).toString().length - (/^10*$/.test(result) ? 1 : 0);
      if(leadingZeros < 7) {
        const power = 10n ** BigInt(result.length + leadingZeros - Rational.#maxFractionalDigits);
        if(quotient % power >= power / 2n) {
          quotient += power;
          result = (quotient / 10n).toString();
        }
      }
      if(!hasRemainder && /0+$/.test(result)) {
        result = result.replace(/0+$/, "");
      } else if(/^10+$/.test(result)) {
        result = result.slice(0, -1);
      }
      if(leadingZeros >= 7) {
        if(result.length > 1) {
          result = result.charAt(0) + "." + result.substring(1);
        }
        return sign + result + (leadingZeros > 0 ? "e-" + leadingZeros : "");
      } else {
        result = "0".repeat(leadingZeros) + result;
        return sign + result.charAt(0) + "." + result.substring(1, Rational.#maxFractionalDigits + 1);
      }
    }
  }

  add(other) {
    const newDividend = this.dividend * other.divisor * this.sign + other.dividend * this.divisor * other.sign;
    const absoluteDividend = newDividend < 0n ? -newDividend : newDividend;
    return new Rational(absoluteDividend, this.divisor * other.divisor, newDividend < 0n ? -1n : 1n);
  }

  subtract(other) {
    return this.add(other.negate());
  }

  multiply(other) {
    return new Rational(this.dividend * other.dividend, this.divisor * other.divisor, this.sign * other.sign);
  }

  divide(other) {
    return new Rational(this.dividend * other.divisor, this.divisor * other.dividend, this.sign * other.sign);
  }

  negate() {
    return new Rational(this.dividend, this.divisor, -this.sign);
  }

  isZero() {
    return this.dividend === 0n;
  }

  #simplify() {
    if(this.divisor !== 1n) {
      const gcd = Rational.#bigintGCD(this.dividend, this.divisor);
      this.dividend /= gcd;
      this.divisor /= gcd;
    }
    if(this.dividend === 0n && this.sign === -1n) {
      this.sign = 1n;
    }
  }

  static #bigintGCD(a, b) {
    while(true) {
      if(b === 0n) return a;
      a %= b;
      if(a === 0n) return b;
      b %= a;
    }
  }
}

module.exports = { NativeFloat, Rational };
