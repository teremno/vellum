/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/vellum_contract.json`.
 */
export type VellumContract = {
  "address": "GtaC3d2ehX8jayPiTzJwP1vbs5PFbCQ4dkS7GoBw7FDN",
  "metadata": {
    "name": "vellumContract",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Vellum — B2B Invoicing + ViDA Tax Automation on Solana"
  },
  "instructions": [
    {
      "name": "createInvoice",
      "discriminator": [
        154,
        170,
        31,
        135,
        134,
        100,
        156,
        146
      ],
      "accounts": [
        {
          "name": "invoice",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  110,
                  118,
                  111,
                  105,
                  99,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "invoiceId"
              }
            ]
          }
        },
        {
          "name": "payerAccount"
        },
        {
          "name": "issuer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "invoiceId",
          "type": "string"
        },
        {
          "name": "payer",
          "type": "pubkey"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "currency",
          "type": "string"
        },
        {
          "name": "taxAmount",
          "type": "u64"
        },
        {
          "name": "taxRate",
          "type": "u16"
        },
        {
          "name": "dueDate",
          "type": "i64"
        },
        {
          "name": "ipfsHash",
          "type": "string"
        },
        {
          "name": "vatIdIssuer",
          "type": "string"
        },
        {
          "name": "vatIdPayer",
          "type": "string"
        }
      ]
    },
    {
      "name": "disputeInvoice",
      "discriminator": [
        10,
        4,
        236,
        98,
        232,
        38,
        60,
        76
      ],
      "accounts": [
        {
          "name": "invoice",
          "writable": true
        },
        {
          "name": "disputer",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "reason",
          "type": "string"
        }
      ]
    },
    {
      "name": "markOverdue",
      "discriminator": [
        178,
        135,
        117,
        229,
        133,
        152,
        175,
        27
      ],
      "accounts": [
        {
          "name": "invoice",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "payInvoice",
      "discriminator": [
        104,
        6,
        62,
        239,
        197,
        206,
        208,
        220
      ],
      "accounts": [
        {
          "name": "invoice",
          "writable": true
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "payerTokenAccount",
          "writable": true
        },
        {
          "name": "issuerTokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "recordTaxPayment",
      "discriminator": [
        198,
        11,
        196,
        159,
        66,
        152,
        141,
        255
      ],
      "accounts": [
        {
          "name": "invoice"
        },
        {
          "name": "taxPaymentRecord",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  97,
                  120,
                  95,
                  112,
                  97,
                  121,
                  109,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "invoice"
              }
            ]
          }
        },
        {
          "name": "recorder",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "currency",
          "type": "string"
        },
        {
          "name": "reference",
          "type": "string"
        }
      ]
    },
    {
      "name": "registerCompany",
      "discriminator": [
        109,
        51,
        247,
        199,
        229,
        252,
        157,
        222
      ],
      "accounts": [
        {
          "name": "company",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  109,
                  112,
                  97,
                  110,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "vatId",
          "type": "string"
        },
        {
          "name": "country",
          "type": "string"
        },
        {
          "name": "walletAddress",
          "type": "pubkey"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "company",
      "discriminator": [
        32,
        212,
        52,
        137,
        90,
        7,
        206,
        183
      ]
    },
    {
      "name": "invoice",
      "discriminator": [
        51,
        194,
        250,
        114,
        6,
        104,
        18,
        164
      ]
    },
    {
      "name": "taxPaymentRecord",
      "discriminator": [
        16,
        186,
        75,
        243,
        125,
        181,
        92,
        133
      ]
    }
  ],
  "events": [
    {
      "name": "invoiceCreated",
      "discriminator": [
        189,
        114,
        235,
        219,
        193,
        125,
        47,
        54
      ]
    },
    {
      "name": "invoicePaid",
      "discriminator": [
        200,
        211,
        168,
        170,
        46,
        82,
        83,
        186
      ]
    },
    {
      "name": "taxPaymentRecorded",
      "discriminator": [
        88,
        114,
        249,
        34,
        114,
        11,
        108,
        56
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidAmount",
      "msg": "Invoice amount must be greater than zero"
    },
    {
      "code": 6001,
      "name": "dueDateInPast",
      "msg": "Due date must be in the future"
    },
    {
      "code": 6002,
      "name": "unauthorizedPayer",
      "msg": "Only the designated payer can pay this invoice"
    },
    {
      "code": 6003,
      "name": "unauthorizedDisputer",
      "msg": "Only the payer can dispute this invoice"
    },
    {
      "code": 6004,
      "name": "invoiceNotPayable",
      "msg": "Invoice is not in a payable state"
    },
    {
      "code": 6005,
      "name": "invoiceNotDisputable",
      "msg": "Invoice is not in a disputable state"
    },
    {
      "code": 6006,
      "name": "invoiceNotOverdue",
      "msg": "Invoice is not overdue yet"
    },
    {
      "code": 6007,
      "name": "stringTooLong",
      "msg": "String exceeds maximum length"
    },
    {
      "code": 6008,
      "name": "missingVatId",
      "msg": "VAT ID is required"
    },
    {
      "code": 6009,
      "name": "missingCurrency",
      "msg": "Currency must be specified"
    },
    {
      "code": 6010,
      "name": "companyAlreadyRegistered",
      "msg": "Company already registered for this authority"
    },
    {
      "code": 6011,
      "name": "unauthorizedTaxRecorder",
      "msg": "Only the invoice issuer can record tax"
    },
    {
      "code": 6012,
      "name": "taxAlreadyRecorded",
      "msg": "Tax has already been recorded for this invoice"
    },
    {
      "code": 6013,
      "name": "missingIpfsHash",
      "msg": "IPFS hash is required"
    }
  ],
  "types": [
    {
      "name": "company",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "vatId",
            "type": "string"
          },
          {
            "name": "country",
            "type": "string"
          },
          {
            "name": "walletAddress",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "invoice",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "invoiceId",
            "type": "string"
          },
          {
            "name": "issuer",
            "type": "pubkey"
          },
          {
            "name": "payer",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "currency",
            "type": "string"
          },
          {
            "name": "taxAmount",
            "type": "u64"
          },
          {
            "name": "taxRate",
            "type": "u16"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "invoiceStatus"
              }
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "dueDate",
            "type": "i64"
          },
          {
            "name": "ipfsHash",
            "type": "string"
          },
          {
            "name": "vatIdIssuer",
            "type": "string"
          },
          {
            "name": "vatIdPayer",
            "type": "string"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "invoiceCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "invoiceId",
            "type": "string"
          },
          {
            "name": "issuer",
            "type": "pubkey"
          },
          {
            "name": "payer",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "currency",
            "type": "string"
          },
          {
            "name": "taxAmount",
            "type": "u64"
          },
          {
            "name": "taxRate",
            "type": "u16"
          },
          {
            "name": "dueDate",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "invoicePaid",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "invoiceId",
            "type": "string"
          },
          {
            "name": "issuer",
            "type": "pubkey"
          },
          {
            "name": "payer",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "taxAmount",
            "type": "u64"
          },
          {
            "name": "paidAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "invoiceStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "draft"
          },
          {
            "name": "pending"
          },
          {
            "name": "paid"
          },
          {
            "name": "overdue"
          },
          {
            "name": "disputed"
          }
        ]
      }
    },
    {
      "name": "taxPaymentRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "invoice",
            "type": "pubkey"
          },
          {
            "name": "recorder",
            "type": "pubkey"
          },
          {
            "name": "taxAmount",
            "type": "u64"
          },
          {
            "name": "taxRate",
            "type": "u16"
          },
          {
            "name": "currency",
            "type": "string"
          },
          {
            "name": "reference",
            "type": "string"
          },
          {
            "name": "paidAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "taxPaymentRecorded",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "invoice",
            "type": "pubkey"
          },
          {
            "name": "taxAmount",
            "type": "u64"
          },
          {
            "name": "taxRate",
            "type": "u16"
          },
          {
            "name": "reference",
            "type": "string"
          },
          {
            "name": "paidAt",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
