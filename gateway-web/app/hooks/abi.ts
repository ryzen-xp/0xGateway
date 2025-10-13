export const ABI = [
  {
    "type": "impl",
    "name": "GatewayImpl",
    "interface_name": "gateway::interface::IGateway"
  },
  {
    "type": "struct",
    "name": "core::byte_array::ByteArray",
    "members": [
      {
        "name": "data",
        "type": "core::array::Array::<core::bytes_31::bytes31>"
      },
      {
        "name": "pending_word",
        "type": "core::felt252"
      },
      {
        "name": "pending_word_len",
        "type": "core::integer::u32"
      }
    ]
  },
  {
    "type": "enum",
    "name": "core::bool",
    "variants": [
      {
        "name": "False",
        "type": "()"
      },
      {
        "name": "True",
        "type": "()"
      }
    ]
  },
  {
    "type": "enum",
    "name": "core::option::Option::<core::integer::u128>",
    "variants": [
      {
        "name": "Some",
        "type": "core::integer::u128"
      },
      {
        "name": "None",
        "type": "()"
      }
    ]
  },
  {
    "type": "enum",
    "name": "core::option::Option::<core::byte_array::ByteArray>",
    "variants": [
      {
        "name": "Some",
        "type": "core::byte_array::ByteArray"
      },
      {
        "name": "None",
        "type": "()"
      }
    ]
  },
  {
    "type": "struct",
    "name": "gateway::types::UserInfo",
    "members": [
      {
        "name": "username",
        "type": "core::byte_array::ByteArray"
      },
      {
        "name": "user_address",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "active",
        "type": "core::bool"
      }
    ]
  },
  {
    "type": "struct",
    "name": "gateway::types::Wallet",
    "members": [
      {
        "name": "chain_symbol",
        "type": "core::byte_array::ByteArray"
      },
      {
        "name": "address",
        "type": "core::felt252"
      },
      {
        "name": "memo",
        "type": "core::option::Option::<core::integer::u128>"
      },
      {
        "name": "tag",
        "type": "core::option::Option::<core::integer::u128>"
      },
      {
        "name": "metadata",
        "type": "core::option::Option::<core::byte_array::ByteArray>"
      },
      {
        "name": "updated_at",
        "type": "core::integer::u64"
      }
    ]
  },
  {
    "type": "interface",
    "name": "gateway::interface::IGateway",
    "items": [
      {
        "type": "function",
        "name": "change_user_address",
        "inputs": [
          {
            "name": "new_address",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "deactivate_account",
        "inputs": [],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "reactivate_account",
        "inputs": [],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "is_account_active",
        "inputs": [
          {
            "name": "username",
            "type": "core::byte_array::ByteArray"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "register_username",
        "inputs": [
          {
            "name": "username",
            "type": "core::byte_array::ByteArray"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "check_username_exist",
        "inputs": [
          {
            "name": "username",
            "type": "core::byte_array::ByteArray"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "add_wallets",
        "inputs": [
          {
            "name": "chain_symbol",
            "type": "core::byte_array::ByteArray"
          },
          {
            "name": "wallet_address",
            "type": "core::felt252"
          },
          {
            "name": "memo",
            "type": "core::option::Option::<core::integer::u128>"
          },
          {
            "name": "tag",
            "type": "core::option::Option::<core::integer::u128>"
          },
          {
            "name": "metadata",
            "type": "core::option::Option::<core::byte_array::ByteArray>"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "remove_wallet",
        "inputs": [
          {
            "name": "chain_symbol",
            "type": "core::byte_array::ByteArray"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get_user_info",
        "inputs": [
          {
            "name": "username",
            "type": "core::byte_array::ByteArray"
          }
        ],
        "outputs": [
          {
            "type": "gateway::types::UserInfo"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_username",
        "inputs": [
          {
            "name": "address",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::byte_array::ByteArray"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_wallet",
        "inputs": [
          {
            "name": "username",
            "type": "core::byte_array::ByteArray"
          },
          {
            "name": "chain_symbol",
            "type": "core::byte_array::ByteArray"
          }
        ],
        "outputs": [
          {
            "type": "gateway::types::Wallet"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_user_chain_symbols",
        "inputs": [
          {
            "name": "username",
            "type": "core::byte_array::ByteArray"
          }
        ],
        "outputs": [
          {
            "type": "core::array::Array::<core::byte_array::ByteArray>"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_all_user_wallets",
        "inputs": [
          {
            "name": "username",
            "type": "core::byte_array::ByteArray"
          }
        ],
        "outputs": [
          {
            "type": "core::array::Array::<gateway::types::Wallet>"
          }
        ],
        "state_mutability": "view"
      }
    ]
  },
  {
    "type": "event",
    "name": "gateway::events::UsernameRegistered",
    "kind": "struct",
    "members": [
      {
        "name": "username",
        "type": "core::byte_array::ByteArray",
        "kind": "data"
      },
      {
        "name": "user_address",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "timestamp",
        "type": "core::integer::u64",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "gateway::events::WalletAdded",
    "kind": "struct",
    "members": [
      {
        "name": "user_address",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "chain_symbol",
        "type": "core::byte_array::ByteArray",
        "kind": "data"
      },
      {
        "name": "wallet_address",
        "type": "core::felt252",
        "kind": "data"
      },
      {
        "name": "timestamp",
        "type": "core::integer::u64",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "gateway::events::WalletRemoved",
    "kind": "struct",
    "members": [
      {
        "name": "user_address",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "username",
        "type": "core::byte_array::ByteArray",
        "kind": "data"
      },
      {
        "name": "chain_symbol",
        "type": "core::byte_array::ByteArray",
        "kind": "data"
      },
      {
        "name": "timestamp",
        "type": "core::integer::u64",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "gateway::events::UserAddressChanged",
    "kind": "struct",
    "members": [
      {
        "name": "username",
        "type": "core::byte_array::ByteArray",
        "kind": "data"
      },
      {
        "name": "old_address",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "new_address",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "timestamp",
        "type": "core::integer::u64",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "gateway::events::AccountDeactivated",
    "kind": "struct",
    "members": [
      {
        "name": "username",
        "type": "core::byte_array::ByteArray",
        "kind": "data"
      },
      {
        "name": "user_address",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "timestamp",
        "type": "core::integer::u64",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "gateway::events::AccountReactivated",
    "kind": "struct",
    "members": [
      {
        "name": "username",
        "type": "core::byte_array::ByteArray",
        "kind": "data"
      },
      {
        "name": "user_address",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "timestamp",
        "type": "core::integer::u64",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "gateway::main::Gateway::Event",
    "kind": "enum",
    "variants": [
      {
        "name": "UsernameRegistered",
        "type": "gateway::events::UsernameRegistered",
        "kind": "nested"
      },
      {
        "name": "WalletAdded",
        "type": "gateway::events::WalletAdded",
        "kind": "nested"
      },
      {
        "name": "WalletRemoved",
        "type": "gateway::events::WalletRemoved",
        "kind": "nested"
      },
      {
        "name": "UserAddressChanged",
        "type": "gateway::events::UserAddressChanged",
        "kind": "nested"
      },
      {
        "name": "AccountDeactivated",
        "type": "gateway::events::AccountDeactivated",
        "kind": "nested"
      },
      {
        "name": "AccountReactivated",
        "type": "gateway::events::AccountReactivated",
        "kind": "nested"
      }
    ]
  }
] as const;
