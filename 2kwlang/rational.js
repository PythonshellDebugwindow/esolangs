const ProgramException = require("./program-exception.js");

class Rational
{
  static #maxFractionalDigits = 5;

  constructor(dividend, divisor, sign)
  {
    this.dividend = dividend;
    this.divisor = divisor;
    this.sign = sign;
    this.#simplify();
  }

  isInteger()
  {
    return this.divisor === 1n;
  }
  getNumerator()
  {
    return this.dividend;
  }

  toString()
  {
    if(this.divisor === 1n)
    {
      return (this.sign === -1n ? "-" : "") + this.dividend;
    }

    const numDecimalDigits = Rational.#maxFractionalDigits;
    let result = (this.dividend * 10n ** BigInt(numDecimalDigits) / this.divisor).toString();
    let decimalPointPosition = result.length - numDecimalDigits;
    if(decimalPointPosition < 0)
    {
      result = "0".repeat(-decimalPointPosition) + result;
      decimalPointPosition = 0;
    }
    result = result.substring(0, decimalPointPosition) + "." + result.substring(decimalPointPosition);
    const hasRemainder = this.dividend * 10n ** BigInt(numDecimalDigits) % this.divisor !== 0n;
    if(!hasRemainder && /[1-9]0+$/.test(result))
    {
      result = result.replace(/0+$/, "");
    }
    if(result.charAt(0) === ".")
    {
      result = "0" + result;
    }
    return (this.sign === -1n ? "-" : "") + result;
  }

  #simplify()
  {
    if(this.divisor !== 1n)
    {
      const gcd = bigintGCD(this.dividend, this.divisor);
      this.dividend /= gcd;
      this.divisor /= gcd;
    }
    if(this.dividend === 0n && this.sign === -1n)
    {
      this.sign = 1n;
    }
  }

  /**
   * Adds second to first in place. Returns first.
   */
  static add(first, second)
  {
    Rational.#ensureRationals(first, second);
    Rational.#_add(first, second);
    return first;
  }

  /**
   * Subtracts second from first in place. Might also change second. Returns first.
   */
  static subtract(first, second)
  {
    Rational.#ensureRationals(first, second);
    second.sign *= -1n;
    Rational.#_add(first, second);
    return first;
  }

  static #_add(first, second)
  {
    if(first.divisor === second.divisor)
    {
      first.dividend = first.dividend * first.sign + second.dividend * second.sign;
    }
    else
    {
      /*
      1   3   1(5)   3(2)
      - + - = ---- + ----
      2   5   2(5)   5(2)
      */
      first.dividend *= second.divisor;
      first.dividend = first.dividend * first.sign + second.dividend * first.divisor * second.sign;
      first.divisor *= second.divisor;
    }
    if(first.dividend < 0n)
    {
      first.dividend *= -1n;
      first.sign = -1n;
    }
    else
    {
      first.sign = 1n;
    }
    first.#simplify();
  }

  /**
   * Multiplies first by second in place. Returns first.
   */
  static multiply(first, second)
  {
    Rational.#ensureRationals(first, second);
    first.dividend *= second.dividend;
    first.divisor *= second.divisor;
    first.sign *= second.sign;
    first.#simplify();
    return first;
  }

  /**
   * Divides first by second in place. Returns first.
  */
  static divide(first, second)
  {
    Rational.#ensureRationals(first, second);
    if(second.dividend === 0n)
    {
      throw ProgramException;
    }
    first.dividend *= second.divisor;
    first.divisor *= second.dividend;
    first.sign *= second.sign;
    first.#simplify();
    return first;
  }

  /**
   * Reduces first modulo second in place. Might also change second. Returns first.
   */
  static modulo(first, second)
  {
    Rational.#ensureRationals(first, second);
    if(second.dividend === 0n)
    {
      throw ProgramException;
    }
    const ad = first.dividend * second.divisor;
    const bc = second.dividend * first.divisor;
    const floor = ad / bc;
    const subtrahend = new Rational(floor * second.dividend, second.divisor, first.sign);
    Rational.subtract(first, subtrahend);
    const secondSign = second.sign;
    second.sign = 1n;
    if(first.sign === -1n)
    {
      Rational.add(first, second);
    }
    if(secondSign === -1n && first.dividend !== 0n)
    {
      Rational.subtract(first, second);
    }
    return first;
  }

  /**
   * Returns whether first equals second. first and second must be Rationals.
   */
  static equals(first, second)
  {
    return first.dividend === second.dividend &&
           first.divisor === second.divisor &&
           first.sign === second.sign;
  }

  /**
   * Returns whether first is less than second.
   */
  static lessThan(first, second)
  {
    /*
    4   17   4(22)   17(5)
    - < -- = ----- < -----
    5   22   5(22)   22(5)
    */
    Rational.#ensureRationals(first, second);
    const firstDiv = first.dividend * second.divisor * first.sign;
    const secondDiv = second.dividend * first.divisor * second.sign;
    return firstDiv < secondDiv;
  }

  /**
   * Returns whether first is greater than second.
   */
  static greaterThan(first, second)
  {
    Rational.#ensureRationals(first, second);
    const firstDiv = first.dividend * second.divisor * first.sign;
    const secondDiv = second.dividend * first.divisor * second.sign;
    return firstDiv > secondDiv;
  }

  static #ensureRationals(first, second)
  {
    if(!(first instanceof Rational && second instanceof Rational))
    {
      throw ProgramException;
    }
  }

  static setMaxFractionalDigits(digits)
  {
    Rational.#maxFractionalDigits = digits;
  }
}

function bigintGCD(a, b)
{
  while(true)
  {
    if(b === 0n) return a;
    a %= b;
    if(a === 0n) return b;
    b %= a;
  }
}

module.exports = Rational;
