// Fichier généré par scripts/build-market-data.py — ne pas modifier à la main.
// Source : Inside Airbnb (CC BY 4.0), logements entiers actifs à Paris.

export type MarketCell = {
  price: number;
  occupancy: number;
  occupancyTop: number;
  sample: number;
  estimated?: boolean;
};

export const MARKET_PARIS = {
  "source": "Inside Airbnb",
  "sourceUrl": "https://insideairbnb.com/paris/",
  "license": "CC BY 4.0",
  "snapshot": "2026-09-16",
  "snapshots": [
    "2025-10-13",
    "2025-11-12",
    "2025-12-13",
    "2026-01-17",
    "2026-02-18",
    "2026-03-21",
    "2026-04-19",
    "2026-05-23",
    "2026-06-16",
    "2026-07-15",
    "2026-08-15",
    "2026-09-16"
  ],
  "previousSnapshot": null,
  "listings": 21421,
  "paris": {
    "0": {
      "price": 138,
      "occupancy": 0.485,
      "occupancyTop": 0.699,
      "sample": 5300
    },
    "1": {
      "price": 184,
      "occupancy": 0.342,
      "occupancyTop": 0.627,
      "sample": 9551
    },
    "2": {
      "price": 310,
      "occupancy": 0.37,
      "occupancyTop": 0.699,
      "sample": 4443
    },
    "3": {
      "price": 473,
      "occupancy": 0.342,
      "occupancyTop": 0.699,
      "sample": 2127
    }
  },
  "parisTrend": null,
  "capacity": {
    "0": {
      "1": 0.619,
      "2": 0.975,
      "3": 1.177,
      "4": 1.318
    },
    "1": {
      "1": 0.502,
      "2": 0.899,
      "3": 0.945,
      "4": 1.125,
      "5": 1.272,
      "6": 1.37
    },
    "2": {
      "2": 0.608,
      "3": 0.739,
      "4": 0.958,
      "5": 0.939,
      "6": 1.149,
      "7": 1.016,
      "8": 1.15
    },
    "3": {
      "4": 0.658,
      "5": 0.761,
      "6": 0.949,
      "7": 0.968,
      "8": 1.125,
      "9": 1.114,
      "10": 1.347
    }
  },
  "amenities": {
    "clim": {
      "occupancy": 1.08,
      "price": 1.12
    },
    "ascenseur": {
      "occupancy": 1,
      "price": 1.098
    },
    "balcon": {
      "occupancy": 1,
      "price": 1.12
    },
    "parking": {
      "occupancy": 1.08,
      "price": 1.037
    },
    "jardin": {
      "occupancy": 1.04,
      "price": 1.039
    },
    "vue": {
      "occupancy": 1,
      "price": 1.098
    }
  },
  "propertyKinds": {
    "loft": {
      "price": 1,
      "occupancy": 1,
      "sample": 79
    },
    "maison": {
      "price": 1,
      "occupancy": 1,
      "sample": 11
    }
  },
  "bathrooms": {
    "2": {
      "price": 1.273,
      "occupancy": 1.1,
      "sample": 1538
    }
  },
  "extraBedrooms": {
    "4": {
      "price": 1.299,
      "occupancy": 1.048,
      "sample": 367
    },
    "5": {
      "price": 1,
      "occupancy": 1,
      "sample": 16
    }
  },
  "seasonality": {
    "1": {
      "price": 0.929,
      "occupancy": 0.885
    },
    "2": {
      "price": 1.023,
      "occupancy": 0.898
    },
    "3": {
      "price": 1.117,
      "occupancy": 1.051
    },
    "4": {
      "price": 1.087,
      "occupancy": 0.961
    },
    "5": {
      "price": 1.16,
      "occupancy": 1.139
    },
    "6": {
      "price": 1.104,
      "occupancy": 1.092
    },
    "7": {
      "price": 1.024,
      "occupancy": 0.83
    },
    "8": {
      "price": 1.002,
      "occupancy": 0.948
    },
    "9": {
      "price": 1.175,
      "occupancy": 1.185
    },
    "10": {
      "price": 0.803,
      "occupancy": 1.032
    },
    "11": {
      "price": 0.742,
      "occupancy": 1.019
    },
    "12": {
      "price": 0.835,
      "occupancy": 0.962
    }
  },
  "arrondissements": {
    "1": {
      "priceIndex": 1.485,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 0.943,
          "occupancyIndex": 1.0,
          "sample": 528
        },
        "sud": {
          "index": 1.031,
          "occupancyIndex": 1.0,
          "sample": 1720
        },
        "est": {
          "index": 0.915,
          "occupancyIndex": 0.98,
          "sample": 1897
        },
        "ouest": {
          "index": 1.071,
          "occupancyIndex": 1.0,
          "sample": 2632
        }
      },
      "buckets": {
        "0": {
          "price": 200,
          "occupancy": 0.512,
          "occupancyTop": 0.699,
          "sample": 184
        },
        "1": {
          "price": 274,
          "occupancy": 0.4,
          "occupancyTop": 0.699,
          "sample": 300
        },
        "2": {
          "price": 480,
          "occupancy": 0.485,
          "occupancyTop": 0.699,
          "sample": 187
        },
        "3": {
          "price": 653,
          "occupancy": 0.485,
          "occupancyTop": 0.699,
          "sample": 78
        }
      }
    },
    "2": {
      "priceIndex": 1.242,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 0.952,
          "occupancyIndex": 1.0,
          "sample": 1532
        },
        "sud": {
          "index": 0.972,
          "occupancyIndex": 1.0,
          "sample": 2838
        },
        "est": {
          "index": 0.977,
          "occupancyIndex": 1.0,
          "sample": 3190
        },
        "ouest": {
          "index": 1.067,
          "occupancyIndex": 1.0,
          "sample": 3834
        }
      },
      "buckets": {
        "0": {
          "price": 167,
          "occupancy": 0.512,
          "occupancyTop": 0.699,
          "sample": 297
        },
        "1": {
          "price": 240,
          "occupancy": 0.4,
          "occupancyTop": 0.699,
          "sample": 468
        },
        "2": {
          "price": 380,
          "occupancy": 0.455,
          "occupancyTop": 0.699,
          "sample": 278
        },
        "3": {
          "price": 550,
          "occupancy": 0.512,
          "occupancyTop": 0.699,
          "sample": 202
        }
      }
    },
    "3": {
      "priceIndex": 1.245,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 0.943,
          "occupancyIndex": 1.0,
          "sample": 3498
        },
        "sud": {
          "index": 1.085,
          "occupancyIndex": 1.0,
          "sample": 2632
        },
        "est": {
          "index": 1.016,
          "occupancyIndex": 1.0,
          "sample": 3197
        },
        "ouest": {
          "index": 0.987,
          "occupancyIndex": 1.0,
          "sample": 3457
        }
      },
      "buckets": {
        "0": {
          "price": 169,
          "occupancy": 0.485,
          "occupancyTop": 0.699,
          "sample": 320
        },
        "1": {
          "price": 236,
          "occupancy": 0.37,
          "occupancyTop": 0.685,
          "sample": 586
        },
        "2": {
          "price": 382,
          "occupancy": 0.441,
          "occupancyTop": 0.699,
          "sample": 294
        },
        "3": {
          "price": 565,
          "occupancy": 0.4,
          "occupancyTop": 0.699,
          "sample": 182
        }
      }
    },
    "4": {
      "priceIndex": 1.31,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 1.029,
          "occupancyIndex": 1.0,
          "sample": 2129
        },
        "sud": {
          "index": 1.03,
          "occupancyIndex": 0.9,
          "sample": 1405
        },
        "est": {
          "index": 0.969,
          "occupancyIndex": 1.0,
          "sample": 2993
        },
        "ouest": {
          "index": 1.012,
          "occupancyIndex": 1.0,
          "sample": 1820
        }
      },
      "buckets": {
        "0": {
          "price": 173,
          "occupancy": 0.485,
          "occupancyTop": 0.699,
          "sample": 242
        },
        "1": {
          "price": 251,
          "occupancy": 0.342,
          "occupancyTop": 0.627,
          "sample": 379
        },
        "2": {
          "price": 414,
          "occupancy": 0.37,
          "occupancyTop": 0.685,
          "sample": 209
        },
        "3": {
          "price": 564,
          "occupancy": 0.356,
          "occupancyTop": 0.699,
          "sample": 76
        }
      }
    },
    "5": {
      "priceIndex": 1.148,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 1.144,
          "occupancyIndex": 1.062,
          "sample": 3002
        },
        "sud": {
          "index": 0.892,
          "occupancyIndex": 0.908,
          "sample": 2213
        },
        "est": {
          "index": 0.942,
          "occupancyIndex": 1.0,
          "sample": 1593
        },
        "ouest": {
          "index": 1.0,
          "occupancyIndex": 0.954,
          "sample": 1109
        }
      },
      "buckets": {
        "0": {
          "price": 157,
          "occupancy": 0.455,
          "occupancyTop": 0.699,
          "sample": 204
        },
        "1": {
          "price": 218,
          "occupancy": 0.37,
          "occupancyTop": 0.655,
          "sample": 347
        },
        "2": {
          "price": 350,
          "occupancy": 0.342,
          "occupancyTop": 0.597,
          "sample": 189
        },
        "3": {
          "price": 504,
          "occupancy": 0.37,
          "occupancyTop": 0.699,
          "sample": 88
        }
      }
    },
    "6": {
      "priceIndex": 1.383,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 1.045,
          "occupancyIndex": 1.0,
          "sample": 1782
        },
        "sud": {
          "index": 0.949,
          "occupancyIndex": 0.9,
          "sample": 1268
        },
        "est": {
          "index": 1.073,
          "occupancyIndex": 1.062,
          "sample": 1939
        },
        "ouest": {
          "index": 0.939,
          "occupancyIndex": 1.062,
          "sample": 1985
        }
      },
      "buckets": {
        "0": {
          "price": 172,
          "occupancy": 0.427,
          "occupancyTop": 0.699,
          "sample": 194
        },
        "1": {
          "price": 274,
          "occupancy": 0.342,
          "occupancyTop": 0.685,
          "sample": 331
        },
        "2": {
          "price": 438,
          "occupancy": 0.342,
          "occupancyTop": 0.658,
          "sample": 174
        },
        "3": {
          "price": 629,
          "occupancy": 0.312,
          "occupancyTop": 0.685,
          "sample": 76
        }
      }
    },
    "7": {
      "priceIndex": 1.38,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 0.986,
          "occupancyIndex": 1.0,
          "sample": 1119
        },
        "sud": {
          "index": 0.915,
          "occupancyIndex": 1.0,
          "sample": 1146
        },
        "est": {
          "index": 1.052,
          "occupancyIndex": 0.98,
          "sample": 1928
        },
        "ouest": {
          "index": 0.996,
          "occupancyIndex": 1.0,
          "sample": 2270
        }
      },
      "buckets": {
        "0": {
          "price": 175,
          "occupancy": 0.512,
          "occupancyTop": 0.699,
          "sample": 166
        },
        "1": {
          "price": 259,
          "occupancy": 0.4,
          "occupancyTop": 0.699,
          "sample": 313
        },
        "2": {
          "price": 439,
          "occupancy": 0.37,
          "occupancyTop": 0.699,
          "sample": 134
        },
        "3": {
          "price": 716,
          "occupancy": 0.285,
          "occupancyTop": 0.685,
          "sample": 65
        }
      }
    },
    "8": {
      "priceIndex": 1.384,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 0.778,
          "occupancyIndex": 1.0,
          "sample": 1136
        },
        "sud": {
          "index": 1.089,
          "occupancyIndex": 1.0,
          "sample": 1021
        },
        "est": {
          "index": 0.979,
          "occupancyIndex": 1.0,
          "sample": 2931
        },
        "ouest": {
          "index": 1.085,
          "occupancyIndex": 1.0,
          "sample": 2924
        }
      },
      "buckets": {
        "0": {
          "price": 179,
          "occupancy": 0.512,
          "occupancyTop": 0.699,
          "sample": 205
        },
        "1": {
          "price": 257,
          "occupancy": 0.427,
          "occupancyTop": 0.699,
          "sample": 308
        },
        "2": {
          "price": 444,
          "occupancy": 0.485,
          "occupancyTop": 0.699,
          "sample": 231
        },
        "3": {
          "price": 655,
          "occupancy": 0.4,
          "occupancyTop": 0.699,
          "sample": 127
        }
      }
    },
    "9": {
      "priceIndex": 1.047,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 0.966,
          "occupancyIndex": 0.98,
          "sample": 1647
        },
        "sud": {
          "index": 1.097,
          "occupancyIndex": 1.0,
          "sample": 2211
        },
        "est": {
          "index": 0.896,
          "occupancyIndex": 1.0,
          "sample": 2665
        },
        "ouest": {
          "index": 1.062,
          "occupancyIndex": 1.0,
          "sample": 3393
        }
      },
      "buckets": {
        "0": {
          "price": 149,
          "occupancy": 0.512,
          "occupancyTop": 0.699,
          "sample": 252
        },
        "1": {
          "price": 194,
          "occupancy": 0.342,
          "occupancyTop": 0.685,
          "sample": 437
        },
        "2": {
          "price": 314,
          "occupancy": 0.4,
          "occupancyTop": 0.699,
          "sample": 219
        },
        "3": {
          "price": 477,
          "occupancy": 0.441,
          "occupancyTop": 0.699,
          "sample": 106
        }
      }
    },
    "10": {
      "priceIndex": 0.931,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 0.901,
          "occupancyIndex": 0.916,
          "sample": 3921
        },
        "sud": {
          "index": 1.099,
          "occupancyIndex": 1.02,
          "sample": 2429
        },
        "est": {
          "index": 0.961,
          "occupancyIndex": 0.9,
          "sample": 3709
        },
        "ouest": {
          "index": 1.078,
          "occupancyIndex": 1.02,
          "sample": 4393
        }
      },
      "buckets": {
        "0": {
          "price": 131,
          "occupancy": 0.427,
          "occupancyTop": 0.699,
          "sample": 356
        },
        "1": {
          "price": 173,
          "occupancy": 0.312,
          "occupancyTop": 0.57,
          "sample": 644
        },
        "2": {
          "price": 282,
          "occupancy": 0.356,
          "occupancyTop": 0.699,
          "sample": 338
        },
        "3": {
          "price": 431,
          "occupancy": 0.427,
          "occupancyTop": 0.699,
          "sample": 167
        }
      }
    },
    "11": {
      "priceIndex": 0.917,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 0.948,
          "occupancyIndex": 0.954,
          "sample": 6100
        },
        "sud": {
          "index": 1.034,
          "occupancyIndex": 1.062,
          "sample": 5165
        },
        "est": {
          "index": 0.939,
          "occupancyIndex": 0.954,
          "sample": 3869
        },
        "ouest": {
          "index": 1.181,
          "occupancyIndex": 0.996,
          "sample": 2962
        }
      },
      "buckets": {
        "0": {
          "price": 132,
          "occupancy": 0.427,
          "occupancyTop": 0.699,
          "sample": 450
        },
        "1": {
          "price": 170,
          "occupancy": 0.342,
          "occupancyTop": 0.57,
          "sample": 934
        },
        "2": {
          "price": 277,
          "occupancy": 0.37,
          "occupancyTop": 0.699,
          "sample": 339
        },
        "3": {
          "price": 381,
          "occupancy": 0.312,
          "occupancyTop": 0.655,
          "sample": 160
        }
      }
    },
    "12": {
      "priceIndex": 0.824,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 1.055,
          "occupancyIndex": 0.916,
          "sample": 427
        },
        "sud": {
          "index": 0.915,
          "occupancyIndex": 0.956,
          "sample": 1550
        },
        "est": {
          "index": 0.929,
          "occupancyIndex": 0.9,
          "sample": 2096
        },
        "ouest": {
          "index": 1.097,
          "occupancyIndex": 1.02,
          "sample": 3322
        }
      },
      "buckets": {
        "0": {
          "price": 120,
          "occupancy": 0.493,
          "occupancyTop": 0.699,
          "sample": 206
        },
        "1": {
          "price": 157,
          "occupancy": 0.342,
          "occupancyTop": 0.655,
          "sample": 381
        },
        "2": {
          "price": 230,
          "occupancy": 0.4,
          "occupancyTop": 0.699,
          "sample": 135
        },
        "3": {
          "price": 344,
          "occupancy": 0.312,
          "occupancyTop": 0.597,
          "sample": 65
        }
      }
    },
    "13": {
      "priceIndex": 0.801,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 1.092,
          "occupancyIndex": 0.954,
          "sample": 1557
        },
        "sud": {
          "index": 0.928,
          "occupancyIndex": 0.954,
          "sample": 1048
        },
        "est": {
          "index": 0.982,
          "occupancyIndex": 1.1,
          "sample": 1490
        },
        "ouest": {
          "index": 0.976,
          "occupancyIndex": 1.096,
          "sample": 1490
        }
      },
      "buckets": {
        "0": {
          "price": 116,
          "occupancy": 0.4,
          "occupancyTop": 0.699,
          "sample": 154
        },
        "1": {
          "price": 153,
          "occupancy": 0.342,
          "occupancyTop": 0.57,
          "sample": 264
        },
        "2": {
          "price": 226,
          "occupancy": 0.37,
          "occupancyTop": 0.57,
          "sample": 93
        },
        "3": {
          "price": 302,
          "occupancy": 0.327,
          "occupancyTop": 0.542,
          "sample": 46
        }
      }
    },
    "14": {
      "priceIndex": 0.866,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 1.129,
          "occupancyIndex": 0.958,
          "sample": 1846
        },
        "sud": {
          "index": 0.933,
          "occupancyIndex": 1.0,
          "sample": 1465
        },
        "est": {
          "index": 0.981,
          "occupancyIndex": 0.9,
          "sample": 1522
        },
        "ouest": {
          "index": 0.931,
          "occupancyIndex": 1.067,
          "sample": 1641
        }
      },
      "buckets": {
        "0": {
          "price": 125,
          "occupancy": 0.427,
          "occupancyTop": 0.699,
          "sample": 180
        },
        "1": {
          "price": 161,
          "occupancy": 0.342,
          "occupancyTop": 0.627,
          "sample": 297
        },
        "2": {
          "price": 252,
          "occupancy": 0.312,
          "occupancyTop": 0.685,
          "sample": 121
        },
        "3": {
          "price": 375,
          "occupancy": 0.227,
          "occupancyTop": 0.4,
          "sample": 55
        }
      }
    },
    "15": {
      "priceIndex": 0.995,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 1.171,
          "occupancyIndex": 1.0,
          "sample": 4600
        },
        "sud": {
          "index": 0.862,
          "occupancyIndex": 1.0,
          "sample": 4121
        },
        "est": {
          "index": 0.997,
          "occupancyIndex": 1.0,
          "sample": 4062
        },
        "ouest": {
          "index": 0.997,
          "occupancyIndex": 0.9,
          "sample": 3186
        }
      },
      "buckets": {
        "0": {
          "price": 138,
          "occupancy": 0.485,
          "occupancyTop": 0.699,
          "sample": 444
        },
        "1": {
          "price": 184,
          "occupancy": 0.4,
          "occupancyTop": 0.685,
          "sample": 751
        },
        "2": {
          "price": 303,
          "occupancy": 0.37,
          "occupancyTop": 0.685,
          "sample": 322
        },
        "3": {
          "price": 468,
          "occupancy": 0.327,
          "occupancyTop": 0.627,
          "sample": 140
        }
      }
    },
    "16": {
      "priceIndex": 1.134,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 1.075,
          "occupancyIndex": 1.0,
          "sample": 3285
        },
        "sud": {
          "index": 0.873,
          "occupancyIndex": 0.908,
          "sample": 4189
        },
        "est": {
          "index": 1.193,
          "occupancyIndex": 1.062,
          "sample": 2277
        },
        "ouest": {
          "index": 0.943,
          "occupancyIndex": 0.9,
          "sample": 1229
        }
      },
      "buckets": {
        "0": {
          "price": 142,
          "occupancy": 0.493,
          "occupancyTop": 0.699,
          "sample": 258
        },
        "1": {
          "price": 211,
          "occupancy": 0.312,
          "occupancyTop": 0.627,
          "sample": 427
        },
        "2": {
          "price": 364,
          "occupancy": 0.285,
          "occupancyTop": 0.542,
          "sample": 319
        },
        "3": {
          "price": 582,
          "occupancy": 0.285,
          "occupancyTop": 0.542,
          "sample": 141
        }
      }
    },
    "17": {
      "priceIndex": 0.918,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 0.849,
          "occupancyIndex": 1.0,
          "sample": 2189
        },
        "sud": {
          "index": 1.066,
          "occupancyIndex": 1,
          "sample": 418
        },
        "est": {
          "index": 0.916,
          "occupancyIndex": 0.9,
          "sample": 3414
        },
        "ouest": {
          "index": 1.123,
          "occupancyIndex": 1.0,
          "sample": 5110
        }
      },
      "buckets": {
        "0": {
          "price": 129,
          "occupancy": 0.527,
          "occupancyTop": 0.699,
          "sample": 288
        },
        "1": {
          "price": 171,
          "occupancy": 0.342,
          "occupancyTop": 0.655,
          "sample": 531
        },
        "2": {
          "price": 272,
          "occupancy": 0.342,
          "occupancyTop": 0.685,
          "sample": 214
        },
        "3": {
          "price": 440,
          "occupancy": 0.312,
          "occupancyTop": 0.699,
          "sample": 103
        }
      }
    },
    "18": {
      "priceIndex": 0.827,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 0.939,
          "occupancyIndex": 1.0,
          "sample": 3995
        },
        "sud": {
          "index": 1.171,
          "occupancyIndex": 1.096,
          "sample": 3937
        },
        "est": {
          "index": 0.901,
          "occupancyIndex": 0.954,
          "sample": 6316
        },
        "ouest": {
          "index": 1.098,
          "occupancyIndex": 1.096,
          "sample": 5018
        }
      },
      "buckets": {
        "0": {
          "price": 119,
          "occupancy": 0.427,
          "occupancyTop": 0.699,
          "sample": 464
        },
        "1": {
          "price": 155,
          "occupancy": 0.312,
          "occupancyTop": 0.542,
          "sample": 1023
        },
        "2": {
          "price": 238,
          "occupancy": 0.37,
          "occupancyTop": 0.627,
          "sample": 332
        },
        "3": {
          "price": 354,
          "occupancy": 0.285,
          "occupancyTop": 0.542,
          "sample": 110
        }
      }
    },
    "19": {
      "priceIndex": 0.725,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 0.968,
          "occupancyIndex": 1.1,
          "sample": 2592
        },
        "sud": {
          "index": 1.066,
          "occupancyIndex": 0.9,
          "sample": 2095
        },
        "est": {
          "index": 0.999,
          "occupancyIndex": 1.1,
          "sample": 2134
        },
        "ouest": {
          "index": 0.986,
          "occupancyIndex": 1.0,
          "sample": 1591
        }
      },
      "buckets": {
        "0": {
          "price": 110,
          "occupancy": 0.4,
          "occupancyTop": 0.699,
          "sample": 190
        },
        "1": {
          "price": 137,
          "occupancy": 0.258,
          "occupancyTop": 0.485,
          "sample": 405
        },
        "2": {
          "price": 191,
          "occupancy": 0.258,
          "occupancyTop": 0.512,
          "sample": 176
        },
        "3": {
          "price": 296,
          "occupancy": 0.258,
          "occupancyTop": 0.427,
          "sample": 81
        }
      }
    },
    "20": {
      "priceIndex": 0.693,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 0.986,
          "occupancyIndex": 0.9,
          "sample": 1771
        },
        "sud": {
          "index": 1.0,
          "occupancyIndex": 1.1,
          "sample": 3244
        },
        "est": {
          "index": 0.96,
          "occupancyIndex": 1.0,
          "sample": 1132
        },
        "ouest": {
          "index": 1.034,
          "occupancyIndex": 0.909,
          "sample": 2567
        }
      },
      "buckets": {
        "0": {
          "price": 104,
          "occupancy": 0.427,
          "occupancyTop": 0.655,
          "sample": 246
        },
        "1": {
          "price": 129,
          "occupancy": 0.285,
          "occupancyTop": 0.493,
          "sample": 425
        },
        "2": {
          "price": 188,
          "occupancy": 0.258,
          "occupancyTop": 0.485,
          "sample": 139
        },
        "3": {
          "price": 292,
          "occupancy": 0.258,
          "occupancyTop": 0.542,
          "sample": 59
        }
      }
    }
  },
  "cities": {
    "lyon": {
      "label": "Lyon",
      "snapshot": "2026-09-17",
      "snapshots": 9,
      "listings": 2747,
      "areas": [
        "1er Arrondissement",
        "2e Arrondissement",
        "3e Arrondissement",
        "4e Arrondissement",
        "5e Arrondissement",
        "6e Arrondissement",
        "7e Arrondissement",
        "8e Arrondissement",
        "9e Arrondissement"
      ],
      "buckets": {
        "0": {
          "price": 83,
          "occupancy": 0.362,
          "occupancyTop": 0.674,
          "sample": 782
        },
        "1": {
          "price": 106,
          "occupancy": 0.312,
          "occupancyTop": 0.592,
          "sample": 1213
        },
        "2": {
          "price": 154,
          "occupancy": 0.279,
          "occupancyTop": 0.493,
          "sample": 507
        },
        "3": {
          "price": 244,
          "occupancy": 0.214,
          "occupancyTop": 0.444,
          "sample": 245
        }
      },
      "seasonality": {
        "1": {
          "price": 0.933,
          "occupancy": 0.908
        },
        "2": {
          "price": 1.019,
          "occupancy": 0.917
        },
        "3": {
          "price": 1.104,
          "occupancy": 0.98
        },
        "4": {
          "price": 1.103,
          "occupancy": 0.976
        },
        "5": {
          "price": 1.111,
          "occupancy": 1.023
        },
        "6": {
          "price": 1.084,
          "occupancy": 0.989
        },
        "7": {
          "price": 1.055,
          "occupancy": 0.83
        },
        "8": {
          "price": 1.076,
          "occupancy": 1.081
        },
        "9": {
          "price": 1.142,
          "occupancy": 1.206
        },
        "10": {
          "price": 0.764,
          "occupancy": 1.055
        },
        "11": {
          "price": 0.762,
          "occupancy": 1.104
        },
        "12": {
          "price": 0.848,
          "occupancy": 0.93
        }
      }
    },
    "bordeaux": {
      "label": "Bordeaux",
      "snapshot": "2026-09-17",
      "snapshots": 9,
      "listings": 3633,
      "areas": [
        "3M-Bourgailh",
        "Ambars-et-Lagrave",
        "Ambs",
        "Arago-La Chataigneraie",
        "Arlac",
        "Artigues-Prs-Bordeaux",
        "Bassens",
        "Beaudsert",
        "Beutre",
        "Bgles",
        "Blanquefort",
        "Bordeaux Maritime",
        "Bordeaux Sud",
        "Bouliac",
        "Bourran",
        "Brivazac-Candau",
        "Bruges",
        "Cap de Bos",
        "Capeyron",
        "Carbon-Blanc",
        "Casino",
        "Caudran",
        "Centre ville (Bordeaux)",
        "Centre ville (Merignac)",
        "Chartrons - Grand Parc - Jardin Public",
        "Chemin Long",
        "Chiquet-Fontaudin",
        "Eysines",
        "Floirac",
        "France Alouette",
        "Gambetta-Mairie-Lissandre",
        "Gradignan",
        "La Bastide",
        "La Glacire",
        "La Paillre-Compostelle",
        "Le Bourg",
        "Le Bouscat",
        "Le Burck",
        "Le Haillan",
        "Le Monteil",
        "Le Taillan-Mdoc",
        "Le Vallon-Les Echoppes",
        "Les Eyquems",
        "Lormont",
        "Magonty",
        "Martignas-sur-Jalle",
        "Nansouty - Saint Gens",
        "Nos",
        "Palmer-Gravires-Cavailles",
        "Parempuyre",
        "Plaisance-Loret-Maregue",
        "Saige",
        "Saint Augustin - Tauzin - Alphonse Dupeux",
        "Saint-Aubin-de-Mdoc",
        "Saint-Louis-de-Montferrand",
        "Saint-Mdard-en-Jalles",
        "Saint-Vincent-de-Paul",
        "Sardine",
        "Talence",
        "Toctoucau",
        "Verthamon",
        "Villenave-d'Ornon"
      ],
      "buckets": {
        "0": {
          "price": 74,
          "occupancy": 0.279,
          "occupancyTop": 0.559,
          "sample": 773
        },
        "1": {
          "price": 95,
          "occupancy": 0.23,
          "occupancyTop": 0.477,
          "sample": 1396
        },
        "2": {
          "price": 138,
          "occupancy": 0.197,
          "occupancyTop": 0.411,
          "sample": 775
        },
        "3": {
          "price": 247,
          "occupancy": 0.148,
          "occupancyTop": 0.279,
          "sample": 689
        }
      },
      "seasonality": {
        "1": {
          "price": 0.913,
          "occupancy": 0.904
        },
        "2": {
          "price": 0.987,
          "occupancy": 0.908
        },
        "3": {
          "price": 1.061,
          "occupancy": 0.952
        },
        "4": {
          "price": 1.102,
          "occupancy": 1.005
        },
        "5": {
          "price": 1.106,
          "occupancy": 1.058
        },
        "6": {
          "price": 1.106,
          "occupancy": 1.013
        },
        "7": {
          "price": 1.106,
          "occupancy": 1.006
        },
        "8": {
          "price": 1.118,
          "occupancy": 1.081
        },
        "9": {
          "price": 1.124,
          "occupancy": 1.125
        },
        "10": {
          "price": 0.773,
          "occupancy": 0.987
        },
        "11": {
          "price": 0.766,
          "occupancy": 0.992
        },
        "12": {
          "price": 0.84,
          "occupancy": 0.969
        }
      }
    },
    "pays-basque": {
      "label": "Pays basque",
      "snapshot": "2026-09-19",
      "snapshots": 9,
      "listings": 4511,
      "areas": [
        "Ahaxe-Alciette-Bascassan",
        "Ahetze",
        "Aincille",
        "Ainhice-Mongelos",
        "Ainhoa",
        "Aldudes",
        "Alos-Sibas-Abense",
        "AlÃ§ay-AlÃ§abÃ©hÃ©ty-Sunharette",
        "Amendeuix-Oneix",
        "Amorots-Succos",
        "Anglet",
        "Anhaux",
        "Arbonne",
        "Arbouet-Sussaute",
        "ArbÃ©rats-SillÃ¨gue",
        "Arcangues",
        "Arhansus",
        "Armendarits",
        "ArnÃ©guy",
        "Arraute-Charritte",
        "Ascain",
        "Ascarat",
        "Ayherre",
        "AÃ¯cirits-Camou-Suhast",
        "Banca",
        "Barcus",
        "Bardos",
        "Bassussarry",
        "Bayonne",
        "Beyrie-sur-Joyeuse",
        "Biarritz",
        "Bidache",
        "Bidarray",
        "Bidart",
        "Biriatou",
        "Bonloc",
        "Boucau",
        "Briscous",
        "Cambo-les-Bains",
        "Came",
        "Caro",
        "Charritte-de-Bas",
        "ChÃ©raute",
        "Ciboure",
        "Domezain-Berraute",
        "Espelette",
        "EstÃ©renÃ§uby",
        "Gabat",
        "Gamarthe",
        "Garindein",
        "Gotein-Libarrenx",
        "Guiche",
        "GuÃ©thary",
        "Halsou",
        "Hasparren",
        "Haux",
        "Hendaye",
        "Hosta",
        "HÃ©lette",
        "Ibarrolle",
        "Idaux-Mendy",
        "Iholdy",
        "Ilharre",
        "Irissarry",
        "IroulÃ©guy",
        "Ispoure",
        "Isturits",
        "Itxassou",
        "Jatxou",
        "Jaxu",
        "Juxue",
        "L'HÃ´pital-Saint-Blaise",
        "La Bastide-Clairence",
        "Labets-Biscay",
        "Lacarre",
        "Laguinge-Restoue",
        "Lahonce",
        "Lantabat",
        "Larceveau-Arros-Cibits",
        "Larrau",
        "Larressore",
        "Lasse",
        "Lecumberry",
        "Licq-AthÃ©rey",
        "Louhossoa",
        "Macaye",
        "Masparraute",
        "MaulÃ©on-Licharre",
        "Mendionde",
        "Menditte",
        "Mendive",
        "Moncayolle-Larrory-Mendibieu",
        "Montory",
        "Mouguerre",
        "Musculdy",
        "MÃ©harin",
        "Ordiarp",
        "OrÃ¨gue",
        "Osserain-Rivareyte",
        "OssÃ¨s",
        "Pagolle",
        "Roquiague",
        "Saint-Esteben",
        "Saint-Jean-Pied-de-Port",
        "Saint-Jean-de-Luz",
        "Saint-Jean-le-Vieux",
        "Saint-Martin-d'Arberoue",
        "Saint-Martin-d'Arrossa",
        "Saint-Michel",
        "Saint-Palais",
        "Saint-Pierre-d'Irube",
        "Saint-PÃ©e-sur-Nivelle",
        "Saint-Ãtienne-de-BaÃ¯gorry",
        "Sainte-EngrÃ¢ce",
        "Sames",
        "Sare",
        "SouraÃ¯de",
        "Suhescun",
        "Tardets-Sorholus",
        "Trois-Villes",
        "Uhart-Cize",
        "Uhart-Mixe",
        "Urcuit",
        "Urepel",
        "Urrugne",
        "Urt",
        "Ustaritz",
        "Villefranque",
        "Viodos-Abense-de-Bas"
      ],
      "buckets": {
        "0": {
          "price": 97,
          "occupancy": 0.197,
          "occupancyTop": 0.329,
          "sample": 765
        },
        "1": {
          "price": 109,
          "occupancy": 0.181,
          "occupancyTop": 0.312,
          "sample": 1532
        },
        "2": {
          "price": 142,
          "occupancy": 0.164,
          "occupancyTop": 0.268,
          "sample": 1175
        },
        "3": {
          "price": 275,
          "occupancy": 0.115,
          "occupancyTop": 0.197,
          "sample": 1039
        }
      },
      "seasonality": {
        "1": {
          "price": 0.905,
          "occupancy": 0.924
        },
        "2": {
          "price": 0.979,
          "occupancy": 0.892
        },
        "3": {
          "price": 1.053,
          "occupancy": 1.041
        },
        "4": {
          "price": 1.07,
          "occupancy": 0.993
        },
        "5": {
          "price": 1.077,
          "occupancy": 0.959
        },
        "6": {
          "price": 1.13,
          "occupancy": 1.067
        },
        "7": {
          "price": 1.22,
          "occupancy": 1.322
        },
        "8": {
          "price": 1.116,
          "occupancy": 1.009
        },
        "9": {
          "price": 1.08,
          "occupancy": 0.995
        },
        "10": {
          "price": 0.782,
          "occupancy": 0.865
        },
        "11": {
          "price": 0.757,
          "occupancy": 0.931
        },
        "12": {
          "price": 0.831,
          "occupancy": 1.002
        }
      }
    }
  },
  "nationalModel": {
    "price": {
      "a": -1.6548,
      "b": 0.7444,
      "r2": 0.908,
      "residualSd": 0.115,
      "zones": 71,
      "crossValidationError": {
        "Paris": 0.117,
        "bordeaux": 0.075,
        "lyon": 0.075,
        "pays-basque": 0.079
      }
    },
    "buckets": {
      "0": {
        "ratio": 0.787,
        "occupancy": 0.321,
        "occupancyTop": 0.617
      },
      "1": {
        "ratio": 1.0,
        "occupancy": 0.271,
        "occupancyTop": 0.534
      },
      "2": {
        "ratio": 1.447,
        "occupancy": 0.238,
        "occupancyTop": 0.452
      },
      "3": {
        "ratio": 2.531,
        "occupancy": 0.181,
        "occupancyTop": 0.362
      }
    },
    "priceSeasonSlope": 0.511,
    "seasonality": {
      "FRD1": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.267,
            "price": 0.625
          },
          "2": {
            "occupancy": 0.394,
            "price": 0.69
          },
          "3": {
            "occupancy": 0.37,
            "price": 0.678
          },
          "4": {
            "occupancy": 1.064,
            "price": 1.033
          },
          "5": {
            "occupancy": 1.246,
            "price": 1.126
          },
          "6": {
            "occupancy": 1.136,
            "price": 1.069
          },
          "7": {
            "occupancy": 2.188,
            "price": 1.607
          },
          "8": {
            "occupancy": 2.639,
            "price": 1.838
          },
          "9": {
            "occupancy": 0.841,
            "price": 0.919
          },
          "10": {
            "occupancy": 0.781,
            "price": 0.888
          },
          "11": {
            "occupancy": 0.411,
            "price": 0.699
          },
          "12": {
            "occupancy": 0.665,
            "price": 0.829
          }
        }
      },
      "FRY1": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 1.61,
            "price": 1.312
          },
          "2": {
            "occupancy": 1.734,
            "price": 1.375
          },
          "3": {
            "occupancy": 1.486,
            "price": 1.248
          },
          "4": {
            "occupancy": 1.371,
            "price": 1.19
          },
          "5": {
            "occupancy": 0.626,
            "price": 0.809
          },
          "6": {
            "occupancy": 0.514,
            "price": 0.752
          },
          "7": {
            "occupancy": 1.023,
            "price": 1.012
          },
          "8": {
            "occupancy": 0.922,
            "price": 0.96
          },
          "9": {
            "occupancy": 0.266,
            "price": 0.625
          },
          "10": {
            "occupancy": 0.461,
            "price": 0.725
          },
          "11": {
            "occupancy": 0.708,
            "price": 0.851
          },
          "12": {
            "occupancy": 1.279,
            "price": 1.143
          }
        }
      },
      "FRB0": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.413,
            "price": 0.7
          },
          "2": {
            "occupancy": 0.504,
            "price": 0.747
          },
          "3": {
            "occupancy": 0.532,
            "price": 0.761
          },
          "4": {
            "occupancy": 1.137,
            "price": 1.07
          },
          "5": {
            "occupancy": 1.296,
            "price": 1.151
          },
          "6": {
            "occupancy": 1.088,
            "price": 1.045
          },
          "7": {
            "occupancy": 1.692,
            "price": 1.354
          },
          "8": {
            "occupancy": 2.022,
            "price": 1.522
          },
          "9": {
            "occupancy": 0.906,
            "price": 0.952
          },
          "10": {
            "occupancy": 0.984,
            "price": 0.992
          },
          "11": {
            "occupancy": 0.59,
            "price": 0.79
          },
          "12": {
            "occupancy": 0.835,
            "price": 0.916
          }
        }
      },
      "FRI3": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.286,
            "price": 0.635
          },
          "2": {
            "occupancy": 0.379,
            "price": 0.683
          },
          "3": {
            "occupancy": 0.4,
            "price": 0.693
          },
          "4": {
            "occupancy": 0.969,
            "price": 0.984
          },
          "5": {
            "occupancy": 1.083,
            "price": 1.042
          },
          "6": {
            "occupancy": 0.986,
            "price": 0.993
          },
          "7": {
            "occupancy": 2.336,
            "price": 1.683
          },
          "8": {
            "occupancy": 3.125,
            "price": 2.086
          },
          "9": {
            "occupancy": 0.808,
            "price": 0.902
          },
          "10": {
            "occupancy": 0.679,
            "price": 0.836
          },
          "11": {
            "occupancy": 0.385,
            "price": 0.686
          },
          "12": {
            "occupancy": 0.566,
            "price": 0.778
          }
        }
      },
      "FRJ2": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.646,
            "price": 0.819
          },
          "2": {
            "occupancy": 1.095,
            "price": 1.049
          },
          "3": {
            "occupancy": 0.668,
            "price": 0.83
          },
          "4": {
            "occupancy": 0.724,
            "price": 0.859
          },
          "5": {
            "occupancy": 0.837,
            "price": 0.917
          },
          "6": {
            "occupancy": 0.822,
            "price": 0.909
          },
          "7": {
            "occupancy": 1.783,
            "price": 1.4
          },
          "8": {
            "occupancy": 2.504,
            "price": 1.769
          },
          "9": {
            "occupancy": 0.731,
            "price": 0.863
          },
          "10": {
            "occupancy": 0.732,
            "price": 0.863
          },
          "11": {
            "occupancy": 0.458,
            "price": 0.723
          },
          "12": {
            "occupancy": 1.0,
            "price": 1.0
          }
        }
      },
      "FR10": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.719,
            "price": 0.856
          },
          "2": {
            "occupancy": 0.682,
            "price": 0.838
          },
          "3": {
            "occupancy": 0.829,
            "price": 0.913
          },
          "4": {
            "occupancy": 1.187,
            "price": 1.096
          },
          "5": {
            "occupancy": 1.123,
            "price": 1.063
          },
          "6": {
            "occupancy": 1.277,
            "price": 1.142
          },
          "7": {
            "occupancy": 1.234,
            "price": 1.12
          },
          "8": {
            "occupancy": 1.086,
            "price": 1.044
          },
          "9": {
            "occupancy": 1.003,
            "price": 1.002
          },
          "10": {
            "occupancy": 1.118,
            "price": 1.06
          },
          "11": {
            "occupancy": 0.777,
            "price": 0.886
          },
          "12": {
            "occupancy": 0.964,
            "price": 0.982
          }
        }
      },
      "FRJ1": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.342,
            "price": 0.664
          },
          "2": {
            "occupancy": 0.453,
            "price": 0.72
          },
          "3": {
            "occupancy": 0.374,
            "price": 0.68
          },
          "4": {
            "occupancy": 0.763,
            "price": 0.879
          },
          "5": {
            "occupancy": 0.878,
            "price": 0.938
          },
          "6": {
            "occupancy": 0.984,
            "price": 0.992
          },
          "7": {
            "occupancy": 2.404,
            "price": 1.717
          },
          "8": {
            "occupancy": 3.322,
            "price": 2.187
          },
          "9": {
            "occupancy": 0.82,
            "price": 0.908
          },
          "10": {
            "occupancy": 0.647,
            "price": 0.82
          },
          "11": {
            "occupancy": 0.343,
            "price": 0.664
          },
          "12": {
            "occupancy": 0.672,
            "price": 0.832
          }
        }
      },
      "FRG0": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.347,
            "price": 0.666
          },
          "2": {
            "occupancy": 0.41,
            "price": 0.699
          },
          "3": {
            "occupancy": 0.429,
            "price": 0.708
          },
          "4": {
            "occupancy": 0.933,
            "price": 0.966
          },
          "5": {
            "occupancy": 1.157,
            "price": 1.08
          },
          "6": {
            "occupancy": 1.127,
            "price": 1.065
          },
          "7": {
            "occupancy": 2.101,
            "price": 1.563
          },
          "8": {
            "occupancy": 2.766,
            "price": 1.902
          },
          "9": {
            "occupancy": 0.831,
            "price": 0.914
          },
          "10": {
            "occupancy": 0.791,
            "price": 0.893
          },
          "11": {
            "occupancy": 0.466,
            "price": 0.727
          },
          "12": {
            "occupancy": 0.642,
            "price": 0.817
          }
        }
      },
      "FRC2": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.551,
            "price": 0.771
          },
          "2": {
            "occupancy": 0.927,
            "price": 0.963
          },
          "3": {
            "occupancy": 0.556,
            "price": 0.773
          },
          "4": {
            "occupancy": 0.861,
            "price": 0.929
          },
          "5": {
            "occupancy": 1.056,
            "price": 1.029
          },
          "6": {
            "occupancy": 0.991,
            "price": 0.995
          },
          "7": {
            "occupancy": 1.759,
            "price": 1.388
          },
          "8": {
            "occupancy": 2.068,
            "price": 1.546
          },
          "9": {
            "occupancy": 0.784,
            "price": 0.89
          },
          "10": {
            "occupancy": 0.835,
            "price": 0.916
          },
          "11": {
            "occupancy": 0.538,
            "price": 0.764
          },
          "12": {
            "occupancy": 1.073,
            "price": 1.037
          }
        }
      },
      "FRD2": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.416,
            "price": 0.702
          },
          "2": {
            "occupancy": 0.509,
            "price": 0.749
          },
          "3": {
            "occupancy": 0.516,
            "price": 0.753
          },
          "4": {
            "occupancy": 1.069,
            "price": 1.035
          },
          "5": {
            "occupancy": 1.203,
            "price": 1.104
          },
          "6": {
            "occupancy": 1.064,
            "price": 1.033
          },
          "7": {
            "occupancy": 1.868,
            "price": 1.444
          },
          "8": {
            "occupancy": 2.227,
            "price": 1.627
          },
          "9": {
            "occupancy": 0.869,
            "price": 0.933
          },
          "10": {
            "occupancy": 0.89,
            "price": 0.944
          },
          "11": {
            "occupancy": 0.572,
            "price": 0.781
          },
          "12": {
            "occupancy": 0.797,
            "price": 0.896
          }
        }
      },
      "FRF3": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.649,
            "price": 0.821
          },
          "2": {
            "occupancy": 0.962,
            "price": 0.981
          },
          "3": {
            "occupancy": 0.552,
            "price": 0.771
          },
          "4": {
            "occupancy": 0.966,
            "price": 0.983
          },
          "5": {
            "occupancy": 1.041,
            "price": 1.021
          },
          "6": {
            "occupancy": 0.991,
            "price": 0.995
          },
          "7": {
            "occupancy": 1.442,
            "price": 1.226
          },
          "8": {
            "occupancy": 1.749,
            "price": 1.383
          },
          "9": {
            "occupancy": 0.796,
            "price": 0.896
          },
          "10": {
            "occupancy": 0.91,
            "price": 0.954
          },
          "11": {
            "occupancy": 0.581,
            "price": 0.786
          },
          "12": {
            "occupancy": 1.361,
            "price": 1.184
          }
        }
      },
      "FRE2": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.444,
            "price": 0.716
          },
          "2": {
            "occupancy": 0.532,
            "price": 0.761
          },
          "3": {
            "occupancy": 0.536,
            "price": 0.763
          },
          "4": {
            "occupancy": 1.188,
            "price": 1.096
          },
          "5": {
            "occupancy": 1.249,
            "price": 1.127
          },
          "6": {
            "occupancy": 1.11,
            "price": 1.056
          },
          "7": {
            "occupancy": 1.645,
            "price": 1.33
          },
          "8": {
            "occupancy": 1.934,
            "price": 1.477
          },
          "9": {
            "occupancy": 0.914,
            "price": 0.956
          },
          "10": {
            "occupancy": 0.944,
            "price": 0.971
          },
          "11": {
            "occupancy": 0.596,
            "price": 0.794
          },
          "12": {
            "occupancy": 0.906,
            "price": 0.952
          }
        }
      },
      "FRE1": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.48,
            "price": 0.734
          },
          "2": {
            "occupancy": 0.61,
            "price": 0.801
          },
          "3": {
            "occupancy": 0.625,
            "price": 0.808
          },
          "4": {
            "occupancy": 1.131,
            "price": 1.067
          },
          "5": {
            "occupancy": 1.171,
            "price": 1.087
          },
          "6": {
            "occupancy": 1.014,
            "price": 1.007
          },
          "7": {
            "occupancy": 1.679,
            "price": 1.347
          },
          "8": {
            "occupancy": 1.884,
            "price": 1.452
          },
          "9": {
            "occupancy": 0.894,
            "price": 0.946
          },
          "10": {
            "occupancy": 0.949,
            "price": 0.974
          },
          "11": {
            "occupancy": 0.646,
            "price": 0.819
          },
          "12": {
            "occupancy": 0.916,
            "price": 0.957
          }
        }
      },
      "FRF2": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.47,
            "price": 0.729
          },
          "2": {
            "occupancy": 0.531,
            "price": 0.76
          },
          "3": {
            "occupancy": 0.571,
            "price": 0.781
          },
          "4": {
            "occupancy": 1.035,
            "price": 1.018
          },
          "5": {
            "occupancy": 1.247,
            "price": 1.126
          },
          "6": {
            "occupancy": 1.132,
            "price": 1.067
          },
          "7": {
            "occupancy": 1.552,
            "price": 1.282
          },
          "8": {
            "occupancy": 1.692,
            "price": 1.354
          },
          "9": {
            "occupancy": 1.012,
            "price": 1.006
          },
          "10": {
            "occupancy": 1.071,
            "price": 1.036
          },
          "11": {
            "occupancy": 0.698,
            "price": 0.846
          },
          "12": {
            "occupancy": 0.989,
            "price": 0.994
          }
        }
      },
      "FRY2": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 1.515,
            "price": 1.263
          },
          "2": {
            "occupancy": 1.703,
            "price": 1.359
          },
          "3": {
            "occupancy": 1.396,
            "price": 1.202
          },
          "4": {
            "occupancy": 1.325,
            "price": 1.166
          },
          "5": {
            "occupancy": 0.603,
            "price": 0.797
          },
          "6": {
            "occupancy": 0.442,
            "price": 0.715
          },
          "7": {
            "occupancy": 1.1,
            "price": 1.051
          },
          "8": {
            "occupancy": 1.061,
            "price": 1.031
          },
          "9": {
            "occupancy": 0.282,
            "price": 0.633
          },
          "10": {
            "occupancy": 0.559,
            "price": 0.775
          },
          "11": {
            "occupancy": 0.704,
            "price": 0.849
          },
          "12": {
            "occupancy": 1.31,
            "price": 1.158
          }
        }
      },
      "FRY4": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.913,
            "price": 0.956
          },
          "2": {
            "occupancy": 0.758,
            "price": 0.876
          },
          "3": {
            "occupancy": 0.738,
            "price": 0.866
          },
          "4": {
            "occupancy": 0.882,
            "price": 0.94
          },
          "5": {
            "occupancy": 0.87,
            "price": 0.934
          },
          "6": {
            "occupancy": 0.609,
            "price": 0.8
          },
          "7": {
            "occupancy": 1.245,
            "price": 1.125
          },
          "8": {
            "occupancy": 1.149,
            "price": 1.076
          },
          "9": {
            "occupancy": 0.957,
            "price": 0.978
          },
          "10": {
            "occupancy": 1.424,
            "price": 1.217
          },
          "11": {
            "occupancy": 1.304,
            "price": 1.155
          },
          "12": {
            "occupancy": 1.15,
            "price": 1.077
          }
        }
      },
      "FRI2": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.394,
            "price": 0.69
          },
          "2": {
            "occupancy": 0.492,
            "price": 0.74
          },
          "3": {
            "occupancy": 0.519,
            "price": 0.754
          },
          "4": {
            "occupancy": 0.861,
            "price": 0.929
          },
          "5": {
            "occupancy": 1.084,
            "price": 1.043
          },
          "6": {
            "occupancy": 0.988,
            "price": 0.994
          },
          "7": {
            "occupancy": 1.969,
            "price": 1.495
          },
          "8": {
            "occupancy": 2.676,
            "price": 1.856
          },
          "9": {
            "occupancy": 0.85,
            "price": 0.923
          },
          "10": {
            "occupancy": 0.831,
            "price": 0.914
          },
          "11": {
            "occupancy": 0.547,
            "price": 0.769
          },
          "12": {
            "occupancy": 0.789,
            "price": 0.892
          }
        }
      },
      "FRK1": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.547,
            "price": 0.769
          },
          "2": {
            "occupancy": 1.09,
            "price": 1.046
          },
          "3": {
            "occupancy": 0.52,
            "price": 0.755
          },
          "4": {
            "occupancy": 0.848,
            "price": 0.922
          },
          "5": {
            "occupancy": 1.046,
            "price": 1.024
          },
          "6": {
            "occupancy": 0.839,
            "price": 0.918
          },
          "7": {
            "occupancy": 1.758,
            "price": 1.387
          },
          "8": {
            "occupancy": 2.45,
            "price": 1.741
          },
          "9": {
            "occupancy": 0.711,
            "price": 0.852
          },
          "10": {
            "occupancy": 0.768,
            "price": 0.881
          },
          "11": {
            "occupancy": 0.452,
            "price": 0.72
          },
          "12": {
            "occupancy": 0.972,
            "price": 0.986
          }
        }
      },
      "FRM0": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.041,
            "price": 0.51
          },
          "2": {
            "occupancy": 0.056,
            "price": 0.518
          },
          "3": {
            "occupancy": 0.069,
            "price": 0.524
          },
          "4": {
            "occupancy": 0.625,
            "price": 0.808
          },
          "5": {
            "occupancy": 0.84,
            "price": 0.918
          },
          "6": {
            "occupancy": 1.574,
            "price": 1.293
          },
          "7": {
            "occupancy": 2.952,
            "price": 1.997
          },
          "8": {
            "occupancy": 3.48,
            "price": 2.267
          },
          "9": {
            "occupancy": 1.489,
            "price": 1.25
          },
          "10": {
            "occupancy": 0.715,
            "price": 0.854
          },
          "11": {
            "occupancy": 0.068,
            "price": 0.524
          },
          "12": {
            "occupancy": 0.091,
            "price": 0.536
          }
        }
      },
      "FRH0": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.279,
            "price": 0.632
          },
          "2": {
            "occupancy": 0.367,
            "price": 0.677
          },
          "3": {
            "occupancy": 0.37,
            "price": 0.678
          },
          "4": {
            "occupancy": 0.95,
            "price": 0.974
          },
          "5": {
            "occupancy": 1.087,
            "price": 1.044
          },
          "6": {
            "occupancy": 1.06,
            "price": 1.031
          },
          "7": {
            "occupancy": 2.28,
            "price": 1.654
          },
          "8": {
            "occupancy": 3.018,
            "price": 2.031
          },
          "9": {
            "occupancy": 0.908,
            "price": 0.953
          },
          "10": {
            "occupancy": 0.712,
            "price": 0.853
          },
          "11": {
            "occupancy": 0.36,
            "price": 0.673
          },
          "12": {
            "occupancy": 0.61,
            "price": 0.801
          }
        }
      },
      "FRL0": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.359,
            "price": 0.672
          },
          "2": {
            "occupancy": 0.549,
            "price": 0.77
          },
          "3": {
            "occupancy": 0.451,
            "price": 0.719
          },
          "4": {
            "occupancy": 0.806,
            "price": 0.901
          },
          "5": {
            "occupancy": 0.998,
            "price": 0.999
          },
          "6": {
            "occupancy": 1.275,
            "price": 1.141
          },
          "7": {
            "occupancy": 2.296,
            "price": 1.662
          },
          "8": {
            "occupancy": 2.718,
            "price": 1.878
          },
          "9": {
            "occupancy": 1.027,
            "price": 1.014
          },
          "10": {
            "occupancy": 0.692,
            "price": 0.843
          },
          "11": {
            "occupancy": 0.293,
            "price": 0.639
          },
          "12": {
            "occupancy": 0.537,
            "price": 0.763
          }
        }
      },
      "FRI1": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.27,
            "price": 0.627
          },
          "2": {
            "occupancy": 0.339,
            "price": 0.662
          },
          "3": {
            "occupancy": 0.351,
            "price": 0.668
          },
          "4": {
            "occupancy": 0.786,
            "price": 0.891
          },
          "5": {
            "occupancy": 0.95,
            "price": 0.974
          },
          "6": {
            "occupancy": 1.008,
            "price": 1.004
          },
          "7": {
            "occupancy": 2.502,
            "price": 1.768
          },
          "8": {
            "occupancy": 3.401,
            "price": 2.227
          },
          "9": {
            "occupancy": 0.877,
            "price": 0.937
          },
          "10": {
            "occupancy": 0.633,
            "price": 0.812
          },
          "11": {
            "occupancy": 0.338,
            "price": 0.662
          },
          "12": {
            "occupancy": 0.546,
            "price": 0.768
          }
        }
      },
      "FRY3": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.73,
            "price": 0.862
          },
          "2": {
            "occupancy": 0.957,
            "price": 0.978
          },
          "3": {
            "occupancy": 0.987,
            "price": 0.993
          },
          "4": {
            "occupancy": 0.891,
            "price": 0.944
          },
          "5": {
            "occupancy": 0.789,
            "price": 0.892
          },
          "6": {
            "occupancy": 0.749,
            "price": 0.872
          },
          "7": {
            "occupancy": 1.197,
            "price": 1.101
          },
          "8": {
            "occupancy": 1.489,
            "price": 1.25
          },
          "9": {
            "occupancy": 0.924,
            "price": 0.961
          },
          "10": {
            "occupancy": 1.254,
            "price": 1.13
          },
          "11": {
            "occupancy": 1.018,
            "price": 1.009
          },
          "12": {
            "occupancy": 1.014,
            "price": 1.007
          }
        }
      },
      "FRK2": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 1.138,
            "price": 1.071
          },
          "2": {
            "occupancy": 1.679,
            "price": 1.347
          },
          "3": {
            "occupancy": 1.097,
            "price": 1.05
          },
          "4": {
            "occupancy": 0.72,
            "price": 0.857
          },
          "5": {
            "occupancy": 0.643,
            "price": 0.818
          },
          "6": {
            "occupancy": 0.761,
            "price": 0.878
          },
          "7": {
            "occupancy": 1.422,
            "price": 1.216
          },
          "8": {
            "occupancy": 1.761,
            "price": 1.389
          },
          "9": {
            "occupancy": 0.603,
            "price": 0.797
          },
          "10": {
            "occupancy": 0.534,
            "price": 0.762
          },
          "11": {
            "occupancy": 0.395,
            "price": 0.691
          },
          "12": {
            "occupancy": 1.247,
            "price": 1.126
          }
        }
      },
      "FRY5": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.62,
            "price": 0.806
          },
          "2": {
            "occupancy": 0.7,
            "price": 0.847
          },
          "3": {
            "occupancy": 0.669,
            "price": 0.831
          },
          "4": {
            "occupancy": 0.927,
            "price": 0.963
          },
          "5": {
            "occupancy": 1.065,
            "price": 1.033
          },
          "6": {
            "occupancy": 0.919,
            "price": 0.959
          },
          "7": {
            "occupancy": 1.044,
            "price": 1.022
          },
          "8": {
            "occupancy": 1.214,
            "price": 1.109
          },
          "9": {
            "occupancy": 1.046,
            "price": 1.024
          },
          "10": {
            "occupancy": 1.255,
            "price": 1.13
          },
          "11": {
            "occupancy": 1.353,
            "price": 1.18
          },
          "12": {
            "occupancy": 1.187,
            "price": 1.096
          }
        }
      },
      "FRC1": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.464,
            "price": 0.726
          },
          "2": {
            "occupancy": 0.522,
            "price": 0.756
          },
          "3": {
            "occupancy": 0.537,
            "price": 0.763
          },
          "4": {
            "occupancy": 0.982,
            "price": 0.991
          },
          "5": {
            "occupancy": 1.245,
            "price": 1.125
          },
          "6": {
            "occupancy": 1.108,
            "price": 1.055
          },
          "7": {
            "occupancy": 1.727,
            "price": 1.371
          },
          "8": {
            "occupancy": 1.956,
            "price": 1.489
          },
          "9": {
            "occupancy": 0.993,
            "price": 0.996
          },
          "10": {
            "occupancy": 0.954,
            "price": 0.976
          },
          "11": {
            "occupancy": 0.656,
            "price": 0.824
          },
          "12": {
            "occupancy": 0.856,
            "price": 0.926
          }
        }
      },
      "FRF1": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.421,
            "price": 0.704
          },
          "2": {
            "occupancy": 0.449,
            "price": 0.718
          },
          "3": {
            "occupancy": 0.472,
            "price": 0.73
          },
          "4": {
            "occupancy": 1.004,
            "price": 1.002
          },
          "5": {
            "occupancy": 1.029,
            "price": 1.015
          },
          "6": {
            "occupancy": 0.995,
            "price": 0.997
          },
          "7": {
            "occupancy": 1.357,
            "price": 1.182
          },
          "8": {
            "occupancy": 1.542,
            "price": 1.277
          },
          "9": {
            "occupancy": 0.859,
            "price": 0.928
          },
          "10": {
            "occupancy": 1.022,
            "price": 1.011
          },
          "11": {
            "occupancy": 0.782,
            "price": 0.889
          },
          "12": {
            "occupancy": 2.068,
            "price": 1.546
          }
        }
      }
    },
    "cityNights": {
      "paris": {
        "name": "Paris",
        "nights": 26299564,
        "year": "2025"
      },
      "lyon": {
        "name": "Lyon",
        "nights": 2475930,
        "year": "2025"
      },
      "lille": {
        "name": "Lille",
        "nights": 1373994,
        "year": "2025"
      },
      "marseille": {
        "name": "Marseille",
        "nights": 3026253,
        "year": "2025"
      },
      "bordeaux": {
        "name": "Bordeaux",
        "nights": 1659485,
        "year": "2025"
      },
      "toulouse": {
        "name": "Toulouse",
        "nights": 1588676,
        "year": "2025"
      },
      "nantes": {
        "name": "Nantes",
        "nights": 703098,
        "year": "2025"
      },
      "nice": {
        "name": "Nice",
        "nights": 8697965,
        "year": "2025"
      },
      "strasbourg": {
        "name": "Strasbourg",
        "nights": 1362649,
        "year": "2025"
      },
      "rouen": {
        "name": "Rouen",
        "nights": 665611,
        "year": "2025"
      },
      "montpellier": {
        "name": "Montpellier",
        "nights": 1107916,
        "year": "2025"
      },
      "grenoble": {
        "name": "Grenoble",
        "nights": 553581,
        "year": "2025"
      },
      "tours": {
        "name": "Tours",
        "nights": 533447,
        "year": "2025"
      },
      "toulon": {
        "name": "Toulon",
        "nights": 1363444,
        "year": "2025"
      },
      "rennes": {
        "name": "Rennes",
        "nights": 436548,
        "year": "2025"
      },
      "reims": {
        "name": "Reims",
        "nights": 748972,
        "year": "2025"
      },
      "orleans": {
        "name": "Orléans",
        "nights": 425236,
        "year": "2025"
      },
      "nancy": {
        "name": "Nancy",
        "nights": 414619,
        "year": "2025"
      },
      "dijon": {
        "name": "Dijon",
        "nights": 665837,
        "year": "2025"
      },
      "aix en provence": {
        "name": "Aix-en-Provence",
        "nights": 698324,
        "year": "2025"
      },
      "annecy": {
        "name": "Annecy",
        "nights": 1197553,
        "year": "2025"
      },
      "bayonne": {
        "name": "Bayonne",
        "nights": 793464,
        "year": "2025"
      },
      "avignon": {
        "name": "Avignon",
        "nights": 675687,
        "year": "2025"
      },
      "frejus": {
        "name": "Fréjus",
        "nights": 1128922,
        "year": "2025"
      },
      "la rochelle": {
        "name": "La Rochelle",
        "nights": 822599,
        "year": "2025"
      },
      "colmar": {
        "name": "Colmar",
        "nights": 762029,
        "year": "2025"
      }
    },
    "communes": 3280,
    "bucketsIdf": {
      "0": {
        "occupancy": 0.485,
        "occupancyTop": 0.699
      },
      "1": {
        "occupancy": 0.342,
        "occupancyTop": 0.627
      },
      "2": {
        "occupancy": 0.37,
        "occupancyTop": 0.699
      },
      "3": {
        "occupancy": 0.342,
        "occupancyTop": 0.699
      }
    }
  }
} as const;
