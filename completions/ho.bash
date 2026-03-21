#!/bin/bash
# Bash completion for HumanOnly CLI (ho)

_ho_completions() {
  local cur prev commands subcommands
  COMPREPLY=()
  cur="${COMP_WORDS[COMP_CWORD]}"
  prev="${COMP_WORDS[COMP_CWORD-1]}"

  commands="login logout whoami list requests engagements marketplace view checkout use status timer log push meetings stats config help"

  case "${prev}" in
    ho|humanonly)
      COMPREPLY=( $(compgen -W "${commands}" -- "${cur}") )
      return 0
      ;;
    timer)
      COMPREPLY=( $(compgen -W "start stop status" -- "${cur}") )
      return 0
      ;;
    config)
      COMPREPLY=( $(compgen -W "set" -- "${cur}") )
      return 0
      ;;
    set)
      if [[ "${COMP_WORDS[COMP_CWORD-2]}" == "config" ]]; then
        COMPREPLY=( $(compgen -W "apiUrl" -- "${cur}") )
        return 0
      fi
      ;;
    marketplace)
      COMPREPLY=( $(compgen -W "--popular --search --space --limit" -- "${cur}") )
      return 0
      ;;
    view)
      COMPREPLY=( $(compgen -W "--verbose" -- "${cur}") )
      return 0
      ;;
    push)
      COMPREPLY=( $(compgen -W "--final" -- "${cur}") )
      return 0
      ;;
    stats)
      COMPREPLY=( $(compgen -W "--earnings --month" -- "${cur}") )
      return 0
      ;;
    engagements)
      COMPREPLY=( $(compgen -W "--status" -- "${cur}") )
      return 0
      ;;
    login)
      COMPREPLY=( $(compgen -W "--token" -- "${cur}") )
      return 0
      ;;
  esac

  # Default: complete with commands if nothing else matches
  if [[ "${cur}" == -* ]]; then
    return 0
  fi

  COMPREPLY=( $(compgen -W "${commands}" -- "${cur}") )
}

complete -F _ho_completions ho
complete -F _ho_completions humanonly
