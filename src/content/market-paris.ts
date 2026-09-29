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
      "snapshot": "2026-08-27",
      "snapshots": 9,
      "listings": 4478,
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
        "Aussurucq",
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
          "price": 95,
          "occupancy": 0.181,
          "occupancyTop": 0.312,
          "sample": 779
        },
        "1": {
          "price": 104,
          "occupancy": 0.181,
          "occupancyTop": 0.296,
          "sample": 1530
        },
        "2": {
          "price": 137,
          "occupancy": 0.153,
          "occupancyTop": 0.263,
          "sample": 1154
        },
        "3": {
          "price": 265,
          "occupancy": 0.115,
          "occupancyTop": 0.197,
          "sample": 1015
        }
      },
      "seasonality": {
        "1": {
          "price": 0.926,
          "occupancy": 0.926
        },
        "2": {
          "price": 1.001,
          "occupancy": 0.894
        },
        "3": {
          "price": 1.076,
          "occupancy": 1.043
        },
        "4": {
          "price": 1.095,
          "occupancy": 0.995
        },
        "5": {
          "price": 1.106,
          "occupancy": 0.961
        },
        "6": {
          "price": 1.163,
          "occupancy": 1.069
        },
        "7": {
          "price": 1.247,
          "occupancy": 1.325
        },
        "8": {
          "price": 1.143,
          "occupancy": 1.012
        },
        "9": {
          "price": 0.818,
          "occupancy": 0.97
        },
        "10": {
          "price": 0.799,
          "occupancy": 0.866
        },
        "11": {
          "price": 0.776,
          "occupancy": 0.933
        },
        "12": {
          "price": 0.851,
          "occupancy": 1.005
        }
      }
    }
  }
} as const;
