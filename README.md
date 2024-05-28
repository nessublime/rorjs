# rorjs

Typescript implementation for Option and Result based on Rust's [Result](https://doc.rust-lang.org/std/result/) and [Option](https://doc.rust-lang.org/std/option/).

## Contents

- [Installation](#installation)
- [Usage](#usage)
  * [Result](#result)
    + [Creation](#creation)
    + [Type safety and Narrowing](#type-safety-and-narrowing)
    + [Unwrap](#unwrap)
    + [UnwrapOr](#unwrapor)
    + [UnwrapOrElse](#unwraporelse)
    + [Map](#map)
    + [MapErr](#maperr)
    + [AndThen](#andthen)
    + [AndThenAsync](#andthenasync)
    + [OrElse](#orelse)
    + [OrElseAsync](#orelseasync)
    + [Ok method](#ok-method)
    + [Err method](#err-method)
    + [And operator method](#and-operator-method)
    + [Or operator method](#or-operator-method)
    + [transposeResult](#transposeresult)
    + [Result combinator functions](#result-combinator-functions)
      - [allResults](#allresults)
      - [anyResults](#anyresults)
      - [tryAllResults](#tryallresults)
  * [Option](#option)
    + [Creation](#creation-1)
    + [Type safety and Narrowing](#type-safety-and-narrowing-1)
    + [Unwrap](#unwrap-1)
    + [Expect](#expect)
    + [UnwrapOr](#unwrapor-1)
    + [UnwrapOrElse](#unwraporelse-1)
    + [OkOr](#okor)
    + [OkOrElse](#okorelse)
    + [Map](#map-1)
    + [Filter](#filter)
    + [AndThen](#andthen-1)
    + [AndThenAsync](#andthenasync-1)
    + [OrElse](#orelse-1)
    + [OrElseAsync](#orelseasync-1)
    + [Zip](#zip)
    + [Flatten](#flatten)
    + [And operator method](#and-operator-method-1)
    + [Or operator method](#or-operator-method-1)
    + [Xor operator method](#xor-operator-method)
    + [transposeOption](#transposeoption)
    + [Option combinator functions](#option-combinator-functions)
      - [allOptions](#alloptions)
      - [anyOptions](#anyoptions)
- [Motivation](#motivation)
  * [Custom error types](#custom-error-types)

## Installation

```
$ npm install rorjs
```

or

```
$ yarn add rorjs
```

## Usage

### Result

The `Result<T, E>` type encapsulates a value of type `T` with a possible error of type `E`. Let's see some examples.

#### Creation

To create an `Ok` result:

```ts
const okResult = ok(1);
```

To create an `Error` result:

```ts
const errResult = err("Wrong input!");
```

Both ok and err values can be of `any` type. In this case the `Ok` value type is number and `Err` value type is string. We could make an `Err` with the built in **Javascript** `Error` type:

```ts
const errResult = err(new Error("Wrong input!"));
```

#### Type safety and Narrowing

Let's say we are working with a `Result<number, Error>`:

```ts
const result: Result<number, Error> = returnsResult();

if(result.isOk()){
  // Typescript now knows that this result is of type Ok<number>
  // We can work safely with it
  console.log(result.getVal());
} else {
  // Typescript narrows the type and knows that is of type Err<Error>
  // We can controll the Error freely
  console.error(result.getErr());
}

// In contrast, we could check if it's Err
if(result.isErr()){
  // Typescript now knows that this result is of type Err<Error>
  // We can controll the Error freely
  console.error(result.getErr());
} else {
  // Typescript narrows the type and knows that is of type Ok<number>
  // We can work safely with it
  console.log(result.getVal());
}
```

`getVal` and `getErr` methods are only available when Typescript knows the concrete type of the `Result` for `Ok` and `Err` respectively.

#### Unwrap

The `unwrap` method extracts the contained value in `Result<T, E>` when is `Ok(t)`. In case of `Err` it throws the contained error.

```ts
const okResult = ok(1);
const errResult = err(new Error("Wrong input!"));

const myOkVal = okResult.unwrap();
console.log(myOkVal); // Prints 1

const myWrongVal = errResult.unwrap(); // Throws "Wrong input!"
```

#### UnwrapOr

The `unwrapOr` method extracts the contained value in `Result<T, E>` when is `Ok(t)`. In case of `Err` it returns the provided value.

```ts
const okResult = ok(1);
const errResult = err(new Error("Wrong input!"));

const myOkVal = okResult.unwrapOr(2);
console.log(myOkVal); // Prints 1

const myWrongVal = errResult.unwrapOr(2);
console.log(myWrongVal); // Prints 2
```

#### UnwrapOrElse

The `UnwrapOrElse` method extracts the contained value in `Result<T, E>` when is `Ok(t)`. In case of `Err` it returns the result of evaluating the provided function.

```ts
const okResult = ok(1);
const errResult = err(new Error("Wrong input!"));

const myOkVal = okResult.unwrapOrElse(() => 2);
console.log(myOkVal); // Prints 1

const myWrongVal = errResult.unwrapOrElse(() => 2);
console.log(myWrongVal); // Prints 2
```

#### Map

The `map` method transforms `Result<T, E>` to `Result<U, E>` by applying the provided function `f` to the contained value of `Ok(t)` and leaving `Err` values unchanged.

```ts
const okResult = ok(1);
const errResult = err(new Error("Wrong input!"));

const myOkVal = okResult
  .map((val) => val * 2).unwrap();

console.log(myOkVal); // Prints 2

const myWrongVal = errResult
  .map((val) => val * 2).unwrap(); // Throws "Wrong input!"
```

#### MapErr

The `mapErr` method transforms `Result<T, E>` to `Result<T, F>` by applying the provided function `f` to the contained value of `Err(err)` and leaving `Ok` values unchanged.

```ts
const okResult = ok(1);
const errResult = err(new Error("Wrong input!"));

const myOkVal = okResult
  .mapErr(
    (err) => err.message + " Value must be greater than 5!"
  )
  .unwrap();

console.log(myOkVal); // Prints 1

const myWrongVal = errResult
  .mapErr(
    (err) => err.message + " Value must be greater than 5!"
  )
  .unwrap(); // Throws "Wrong input! Value must be greater than 5!"
```

#### AndThen

The `andThen` calls `f` if the result is `Ok`, otherwise returns the `Err` value of self.

This function can be used for control flow based on Result values.

```ts
const x = ok(1);
x.andThen((val) => ok(val + 1)).unwrap() // Yields 2

const x = ok(1);
x.andThen(() => err("late error")).unwrap() // Throws "late error"

const x = err("early error");
x.andThen((val) => ok(val + 1)).unwrap() // Throws "early error"

const x = err("early error");
x.andThen(() => err("late error")).unwrap() // Throws "early error"
```

#### AndThenAsync

The `andThenAsync` is analogous to `andThen` method but taking an async function and returning a `Promise`.


#### OrElse

The `orElse` calls `f` if the result is `Err`, otherwise returns the `Ok` value of self.

This function can be used for control flow based on Result values.

```ts
const x = ok(1);
x.orElse((err) => ok(2)).unwrap() // Yields 1

const x = ok(1);
x.orElse((err) => err("late error")).unwrap() // Yields 1

const x = err("early error");
x.orElse((err) => ok(1)).unwrap() // Yields 1

const x = err("early error");
x.orElse((err) => err("late error")).unwrap() // Throws "late error"
```

#### OrElseAsync

The `orElseAsync` is analogous to `orElse` method but taking an async function and returning a `Promise`.

#### Ok method

The `ok` method transforms `Result<T,E>` into `Option<T>`, mapping `Ok(v)` to `Some(v)` and `Err(e)` to None.

```ts
const okResult = ok(1);
const errResult = err(new Error("Wrong input!"));

const mySomeVal: Some<number> = okResult.ok();
const myNone: None = myWrongVal.ok();
```

#### Err method

The `err` method transforms `Result<T,E>` into `Option<E>`, mapping `Err(e)` to `Some(e)` and `Ok(v)` to None.

```ts
const okResult = ok(1);
const errResult = err(new Error("Wrong input!"));

const myNone: None = okResult.err();
const mySomeErr: Some<Error> = myWrongVal.err();
```

#### And operator method

The `and` method treats the `Result` as a boolean value, where `Ok` acts like true and `Err` acts like false.

The `and` method can produce a `Result<U, E>` value having a different inner type U than `Result<T, E>`.

```ts
const x = ok(2);
const y = err("late error");
x.and(y).unwrap() // Throws "late error"

const x = err("early error");
const y = ok(2);
x.and(y).unwrap() // Throws "early error"

const x = err("not a 2");
const y = err("late error");
x.and(y).unwrap() // Throws "not a 2"

const x = ok(2);
const y = ok("hello world");
x.and(y).unwrap() // Yields "hello world"
```

#### Or operator method

The `or` method treats the `Result` as a boolean value like the `and` method.

The `or` method can produce a `Result<T, F>` value having a different error type F than `Result<T, E>`.

```ts
const x = ok(2);
const y = err("late error");
x.or(y).unwrap() // Yields 2

const x = err("early error");
const y = ok(2);
x.or(y).unwrap() // Yields 2

const x = err("not a 2");
const y = err("late error");
x.or(y).unwrap() // Throws "late error"

const x = ok(2);
const y = ok("hello world");
x.or(y).unwrap() // Yields 2
```

#### transposeResult

The `transposeResult` function transforms a `Result` of an `Option` into an `Option` of a `Result`.

`Ok(None)` will be mapped to `None`. `Ok(Some(_))` and `Err(_)` will be mapped to `Some(Ok(_))` and `Some(Err(_))`.

 ```ts
 const r = ok(some(2));
 const o = transposeResult(r);
 // Yields Some(Ok(2))

 const r = ok(none());
 const o = transposeResult(r);
 // Yields None

 const r = err(some("error"));
 const o = transposeResult(r);
 // Yields Some(Err("error"))
 ```

#### Result combinator functions

These functions combine multiple `Result`'s into a single `Result` output

##### allResults

The `allResults` function evaluates a set of `Result`s. Returns an `Ok` with all `Ok` values if there is no `Error`. Returns `Error` with the first evaluated error result.

```ts
const x = ok(2);
const y = ok("hello");
const z = ok({ foo: "bar" });
allResults(x, y, z) // Yields Ok<[2, "hello", { foo: "bar" }]>

const x = ok(2);
const y = ok("hello");
const z = err("late error");
allResults(x, y, z) // Yields Err<"late error">

const x = err("early error");
const y = ok(2);
const z = err("late error");
allResults(x, y, z) // Yields Err<"early error">
```

##### anyResults

The `anyResults` function evaluates a set of `Result`s. Returns an `Ok` with the first result evaluated is `Ok`. If no `Ok` is found, returns an `Error` containing the collected error values.

```ts
const x = ok(2);
const y = ok("hello");
const z = ok({ foo: "bar" });
anyResults(x, y, z) // Yields Ok<2>

const x = err("early error");
const y = ok("hello");
const z = ok(2);
anyResults(x, y, z) // Yields Ok<"hello">

const x = err("early error");
const y = err("oops");
const z = err("late error");
anyResults(x, y, z) // Yields Err<["early error", "oops", "late error"]>
```

##### tryAllResults

The `tryAllResults` function is a little bit more especial. valuates a set of `Result`s wether they are `Err` or `Ok`. Returns an array of `Option`s with all encountered `Err`. If all values are `Ok`, returns a tuple combining all values.

```ts
const x = ok(2);
const y = ok("hello");
const z = ok({ foo: "bar" });
anyResults(x, y, z) // Yields Ok<[2, "hello", { foo: "bar" }]>

const x = ok("hello");
const y = err("early error");
const z = ok(2);
anyResults(x, y, z) // Yields Err<[None, Some<"early error">, None]>

const x = err("early error");
const y = err("oops");
const z = err("late error");
anyResults(x, y, z) // Yields Err<[Some<"early error">, Some<"oops">, Some<"late error">]>
```

### Option

The `Option<T>` type encapsulates a value of type `T` wich can be possibly undefined. Is a superposition of types `Some<T>` and `None`

#### Creation

To create a `Some` option:

```ts
const someValue = some(1);
```

To create a `None` option:

```ts
const noneValue = none();
```

To create an `Option` from a value that you don't know if it's actually defined or not use the `optionFrom` function:

```ts
const possiblyUndefinedValue = suspiciousFunction();

const option = optionFrom(possiblyUndefinedValue);
```

#### Type safety and Narrowing

Let's say we are working with a `Option<number>`:

```ts
const opt: Option<number> = returnsOption();

if(result.isSome()){
  // Typescript now knows that this option is of type Some<number>
  // We can work safely with it
  console.log(result.getVal());
} else {
  // Typescript narrows the type and knows that is of type None
}

// In contrast, we could check if it's Err
if(result.isNone()){
  // Typescript now knows that this result is of type None
} else {
  // Typescript now knows that this option is of type Some<number>
  // We can work safely with it
  console.log(result.getVal());
}
```

`getVal` method is only available when Typescript knows the concrete type of the `Option` for `Some`.

#### Unwrap

The `unwrap` method extracts the contained value in `Option<T>` when is `Some`. If is `None` throws error with generic message.

```ts
const someOption = some(1);
const noneOption = none();

const value = someOption.unwrap();
console.log(value); // Prints 1

const noneValue = errResult.unwrap(); // Throws OptionUnwrapError
```

#### Expect

The `expect` method extracts the contained value in `Option<T>` when is `Some`. If is `None` throws an Error with the provided message.

```ts
const someOption = some(1);
const noneOption = none();

const value = someOption.expect();
console.log(value); // Prints 1

const noneValue = errResult.expect("Oops!"); // Throws "Oops!"
```

#### UnwrapOr

The `unwrapOr` method extracts the contained value in `Option<T>` when is `Some(t)`. In case of `None` it returns the provided value.

```ts
const someOption = ok(1);
const noneOption = none();

const someValue = someOption.unwrapOr(2);
console.log(someValue); // Prints 1

const noneValue = noneOption.unwrapOr(2);
console.log(noneValue); // Prints 2
```

#### UnwrapOrElse

The `UnwrapOrElse` method extracts the contained value in `Option<T>` when is `Some(t)`. In case of `None` it returns the result of evaluating the provided function.

```ts
const someOption = ok(1);
const noneOption = none();

const someValue = someOption.unwrapOrElse(() => 2);
console.log(someValue); // Prints 1

const noneValue = noneOption.unwrapOrElse(() => 2);
console.log(noneValue); // Prints 2
```

#### OkOr

The `okOr` method transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to `Ok(v)` and None to `Err(err)`.

Arguments passed to `okOr` are eagerly evaluated; if you are passing the result of a function call, it is recommended to use `okOrElse`, which is lazily evaluated.

```ts
const someOption = ok(1);
const noneOption = none();

const okResult: Result<number, string> = someOption.okOr("an error");
console.log(okResult.unwrap()); // Prints 1

const noneValue: Result<number, string> = noneOption.okOr("an error");
console.log(noneValue.unwrap()); // Throws "an error"
```

#### OkOrElse

The `okOrElse` method transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to `Ok(v)` and None to `Err(f())`.

```ts
const someOption = ok(1);
const noneOption = none();

const okResult: Result<number, string> = someOption.okOrElse(() => "an error");
console.log(okResult.unwrap()); // Prints 1

const noneValue: Result<number, string> = noneOption.okOrElse(() => "an error");
console.log(noneValue.unwrap()); // Throws "an error"
```

#### Map

The `map` method transforms `Option<T>` to `Option<U>` by applying the provided function `f` to the contained value of `Some(t)` and leaving `None` values unchanged.

```ts
const someOption = ok(1);
const noneOption = none();

const someValue = someOption
  .map((val) => val * 2).unwrap();

console.log(someValue); // Prints 2

const noneValue = noneOption
  .map((val) => val * 2).unwrap(); // Throws OptionUnwrapError
```

#### Filter

The `filter` method calls the provided predicate function `f` on the contained value `t` if the `Option` is `Some(t)`, and returns `Some(t)` if the function returns true; otherwise, returns `None`.

```ts
const someOption = ok(1);
const noneOption = none();

const someValue = someOption
  .filter((val) => true).unwrap();

console.log(someValue); // Prints 2

const filteredValue = someOption
  .filter((val) => false).unwrap(); // Throws OptionUnwrapError

const noneValue = noneOption
  .filter((val) => true).unwrap(); // Throws OptionUnwrapError

const noneFilteredValue = noneOption
.filter((val) => false).unwrap(); // Throws OptionUnwrapError
```

#### AndThen

The `andThen` returns `None` if the option is `None`, otherwise calls `f` with the wrapped value and returns the result.

Some languages call this operation flatmap.

```ts
const x = some(1);
x.andThen((val) => some(val + 1)).unwrap() // Yields 2

const x = some(1);
x.andThen(() => none()).unwrap() // Throws OptionUnwrapError

const x = none();
x.andThen((val) => some(val + 1)).unwrap() // Throws OptionUnwrapError

const x = none();
x.andThen(() => none()).unwrap() // Throws OptionUnwrapError
```

#### AndThenAsync

The `andThenAsync` is analogous to `andThen` method but taking an async function and returning a `Promise`.

#### OrElse

The `orElse` returns the option if it contains a value, otherwise calls `f` and returns the result.

```ts
const x = some(1);
x.orElse(() => some(2)).unwrap() // Yields 1

const x = some(1);
x.orElse(() => none()).unwrap() // Yields 1

const x = none();
x.orElse(() => some(1)).unwrap() // Yields 1

const x = none();
x.orElse(() => none()).unwrap() // Throws OptionUnwrapError
```

#### OrElseAsync

The `orElseAsync` is analogous to `orElse` method but taking an async function and returning a `Promise`.

#### Zip

The `zip` method returns `Some([x, y])` if this is `Some(x)` and the provided Option value is `Some(y)`; otherwise, returns `None`

```ts
const x = some(1);
const y = some("hello");
console.log(x.zip(y).unwrap()); // Prints [1, "hello"]

const x = some(1);
const y = none();
console.log(x.zip(y).unwrap()); // Throws error

const x = none();
const y = some(1);
console.log(x.zip(y).unwrap()); // Throws error

const x = none();
const y = none();
console.log(x.zip(y).unwrap()); // Throws error
```

#### Flatten

The `flatten` method removes one level of nesting from an `Option<Option<T>>`

```ts
const opt1: Option<Option<number>> = some(some(1));
const flat1 = opt1.flatten(); // Yields Some(1);

const opt2: Option<Option<number>> = some(none());
const flat2 = opt2.flatten(); // Yields None;

const opt3: Option<Option<number>> = none();
const flat3 = opt3.flatten(); // Yields None;
```

#### And operator method

The `and` method treats the `Option` as a boolean value, where `Some` acts like true and `None` acts like false.

```ts
const x = some(2);
const y = none();
x.and(y).unwrap(); // Throws error

const x = none();
const y = some(2);
x.and(y).unwrap(); // Throws error

const x = none();
const y = none();
x.and(y).unwrap(); // Throws error

const x = some(2);
const y = some("hello world");
x.and(y).unwrap(); // Yields "hello world"
```

#### Or operator method

The `or` method treats the `Option` as a boolean value like the `and` method.

```ts
const x = some(2);
const y = none();
x.or(y).unwrap(); // Yields 2

const x = none();
const y = some(2);
x.or(y).unwrap(); // Yields 2

const x = none();
const y = none();
x.or(y).unwrap() // Throws "late error"

const x = some(2);
const y = some("hello world");
x.or(y).unwrap() // Yields 2
```

#### Xor operator method

The `xor` method treats the `Option` as a boolean value like the `and` and `or` methods.

```ts
const x = some(2);
const y = none();
x.xor(y).unwrap(); // Yields 2

const x = none();
const y = some(2);
x.xor(y).unwrap(); // Yields 2

const x = none();
const y = none();
x.xor(y).unwrap() // Throws "late error"

const x = some(2);
const y = some("hello world");
x.xor(y).unwrap() // Throws "late error"
```

#### transposeOption

The `transposeOption` function transforms a `Option` of a `Result` into an `Result` of an `Option`.

`None` will be mapped to `Ok(None)`. `Some(Ok(_))` and `Some(Err(_))` will be mapped to `Ok(Some(_))` and `Err(_)`.

 ```ts
 const r = some(ok(2));
 const o = transposeOption(r);
 // Yields Ok(Some(2))

 const r = some(err("error"));
 const o = transposeOption(r);
 // Yields Err("error")

 const r = none();
 const o = transposeOption(r);
 // Yields Ok(None)
 ```

#### Option combinator functions

These functions combine multiple `Option`'s into a single `Option` output

##### allOptions

The `allOptions` function evaluates a set of `Option`s. Returns a `Some` with all `Some` values if there is no `None`. Returns `None` with the first evaluated `None` result.

```ts
const x = some(2);
const y = some("hello");
const z = some({ foo: "bar" });
allOptions(x, y, z) // Yields Some<[2, "hello", { foo: "bar" }]>

const x = some(2);
const y = some("hello");
const z = none();
allOptions(x, y, z) // Yields None

const x = none();
const y = some(2);
const z = none();
allOptions(x, y, z) // Yields None
```

##### anyOptions

The `anyOptions` function evaluates a set of `Result`s. Returns a `Some` with the first evaluated `Some`value. Returns `None` if no `Some` values are found.

```ts
const x = some(2);
const y = some("hello");
const z = some({ foo: "bar" });
anyOptions(x, y, z) // Yields Some<2>

const x = none();
const y = some("hello");
const z = some(2);
anyOptions(x, y, z) // Yields Some<"hello">

const x = none();
const y = none();
const z = none();
anyOptions(x, y, z) // Yields None
```

## Motivation

Traditionally a function that could possibly return an error would be:

```ts
function getSquareRoot(num: number): number {
  if (num < 0) throw new Error("Invalid negative number")

  return Math.sqrt(num)
}

// The API tell's us that this function returns a number
const mySqr = getSquareRoot(-2)
```

And this is OK but when we expose this square root API the user does not know wether this function throws an error or what type of error it is.

If we encapsulate the return value in a `Result` type:

```ts
function getSquareRoot(num: number): Result<number> {
  if (num < 0) return error(new Error("Invalid negative number"))

  return ok(Math.sqrt(num))
}

// mySqr is not a number. Is a Result<number, Error>
// So in order to use it we must check explicitely if it is a valid value or an Error
const mySqr = getSquareRoot(-2)
```

Here we are returning a `Result` wrapping the error we would have throught with the `error()` function. And returning an Ok result wrapping the valid value with the `ok()` function.

The value of `mySqr` is not directly accesible since we don't know if it contains a valid value or error. We need to explicitely check:

```ts
const mySqr = getSquareRoot(4)

if(mySqr.isOk()){
  // TS Compiler narrows value
  // getValue() is available to get the wrapped value
  console.log(mySqr.getValue()) // Prints: 2
} else {
  // Otherwise getErr() is available to get the wrapped error
  const error = mySqr.getErr()

  // Treat the error
  throw error
}
```

Another solution is to use the `unwrap()` method, wich if it is an Ok Result returns the value or in case of an Error Result throws the error as a traditional exception.

```ts
const okResult = getSquareRoot(4)
const errorResult = getSquareRoot(-2)

console.log(okResult.unwrap()) // Prints: 2

console.log(errorResult.unwrap()) // Throws exception
```

### Custom error types

```ts
function getSquareRoot(num: number): Result<number, InvalidSqrInput> {
  if (num < 0) return error(new InvalidSqrInput(num))

  return ok(Math.sqrt(num))
}
```

Note that with this type of `Result` we are always aware of the different types of errors that the API could return.
