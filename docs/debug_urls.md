# Debug URLs

Base URL:

```text
http://localhost:8000/
```

## Basic

```text
http://localhost:8000/
http://localhost:8000/?textSpeed=instant
http://localhost:8000/?debug=1&jump=title
http://localhost:8000/?debug=1&jump=opening&textSpeed=instant
http://localhost:8000/?debug=1&jump=heroine_select
```

## Main Game

```text
http://localhost:8000/?debug=1&jump=before_open&heroine=HAKIMA&turn=1&textSpeed=instant
http://localhost:8000/?debug=1&jump=quiz&heroine=HAKIMA&textSpeed=instant
http://localhost:8000/?debug=1&jump=after_close&heroine=HAKIMA&turn=1&textSpeed=instant
http://localhost:8000/?debug=1&jump=turn5_after_close&heroine=HAKIMA&textSpeed=instant
```

## Turn Result

```text
http://localhost:8000/?debug=1&jump=turn_result&heroine=HAKIMA&turn=1
http://localhost:8000/?debug=1&jump=result_encourage&heroine=HAKIMA&turn=1
http://localhost:8000/?debug=1&jump=result_evaluate&heroine=MIRA&turn=1
http://localhost:8000/?debug=1&jump=result_surprise&heroine=DARIYA&turn=1
```

Aliases:

```text
http://localhost:8000/?debug=1&jump=result_low&heroine=HAKIMA
http://localhost:8000/?debug=1&jump=result_mid&heroine=MIRA
http://localhost:8000/?debug=1&jump=result_high&heroine=DARIYA
```

## Ending

```text
http://localhost:8000/?debug=1&jump=ending_good&heroine=HAKIMA
http://localhost:8000/?debug=1&jump=ending_normal&heroine=HAKIMA
```

Heroine parameter values:

```text
HAKIMA
MIRA
DARIYA
```
