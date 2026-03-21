#compdef ho humanonly

# Zsh completion for HumanOnly CLI (ho)

_ho() {
  local -a commands
  commands=(
    'login:Authenticate with HumanOnly'
    'logout:Log out and clear credentials'
    'whoami:Show current logged-in user'
    'list:List your requests and engagements'
    'requests:List your requests'
    'engagements:List your active engagements'
    'marketplace:Browse open requests'
    'view:View request details'
    'checkout:Set active context (request or engagement)'
    'use:Set active context (alias for checkout)'
    'status:Show current context status'
    'timer:Time tracking (start/stop/status)'
    'log:Log time manually'
    'push:Push deliverable'
    'meetings:View upcoming meetings'
    'stats:View your stats'
    'config:Manage CLI config'
    'help:Display help'
  )

  _arguments -C \
    '1: :->command' \
    '*:: :->args'

  case $state in
    command)
      _describe -t commands 'ho command' commands
      ;;
    args)
      case $words[1] in
        timer)
          local -a timer_commands
          timer_commands=(
            'start:Start tracking time'
            'stop:Stop timer and submit time entry'
            'status:Show timer status'
          )
          _describe -t timer_commands 'timer command' timer_commands
          ;;
        config)
          local -a config_commands
          config_commands=(
            'set:Set a config value'
          )
          _describe -t config_commands 'config command' config_commands
          ;;
        marketplace)
          _arguments \
            '--popular[Sort by popularity]' \
            '--search[Search by keyword]:query:' \
            '--space[Filter by space]:slug:' \
            '--limit[Limit results]:number:'
          ;;
        view)
          _arguments \
            '--verbose[Show full description]' \
            '1:request ID:'
          ;;
        checkout|use)
          _arguments '1:request or engagement ID:'
          ;;
        push)
          _arguments \
            '--final[Mark as final deliverable]' \
            '1:file:_files'
          ;;
        stats)
          _arguments \
            '--earnings[Show earnings detail]' \
            '--month[Show this month]'
          ;;
        engagements)
          _arguments \
            '--status[Filter by status]:status:(ACTIVE COMPLETED CANCELLED DISPUTED)'
          ;;
        login)
          _arguments \
            '--token[Login with API token]:token:'
          ;;
        log)
          _arguments \
            '1:duration (e.g. 1h30m):' \
            '*:description:'
          ;;
      esac
      ;;
  esac
}

_ho "$@"
