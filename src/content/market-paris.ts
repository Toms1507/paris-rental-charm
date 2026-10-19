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
  "listings": 20314,
  "paris": {
    "0": {
      "price": 124,
      "occupancy": 0.427,
      "occupancyTop": 0.699,
      "sample": 4842
    },
    "1": {
      "price": 162,
      "occupancy": 0.312,
      "occupancyTop": 0.597,
      "sample": 9041
    },
    "2": {
      "price": 272,
      "occupancy": 0.342,
      "occupancyTop": 0.699,
      "sample": 4325
    },
    "3": {
      "price": 410,
      "occupancy": 0.342,
      "occupancyTop": 0.699,
      "sample": 2106
    }
  },
  "parisTrend": null,
  "capacity": {
    "0": {
      "1": 0.702,
      "2": 0.965,
      "3": 1.154,
      "4": 1.28
    },
    "1": {
      "1": 0.56,
      "2": 0.901,
      "3": 0.943,
      "4": 1.115,
      "5": 1.248,
      "6": 1.349
    },
    "2": {
      "2": 0.618,
      "3": 0.738,
      "4": 0.959,
      "5": 0.929,
      "6": 1.142,
      "7": 1.004,
      "8": 1.137
    },
    "3": {
      "4": 0.656,
      "5": 0.758,
      "6": 0.949,
      "7": 0.969,
      "8": 1.122,
      "9": 1.116,
      "10": 1.344
    }
  },
  "amenities": {
    "clim": {
      "occupancy": 1.08,
      "price": 1.12
    },
    "ascenseur": {
      "occupancy": 1,
      "price": 1.1
    },
    "balcon": {
      "occupancy": 1,
      "price": 1.12
    },
    "parking": {
      "occupancy": 1.08,
      "price": 1.032
    },
    "jardin": {
      "occupancy": 1.048,
      "price": 1.061
    },
    "vue": {
      "occupancy": 1,
      "price": 1.096
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
      "sample": 10
    }
  },
  "bathrooms": {
    "2": {
      "price": 1.282,
      "occupancy": 1.1,
      "sample": 1511
    }
  },
  "extraBedrooms": {
    "4": {
      "price": 1.299,
      "occupancy": 1.048,
      "sample": 366
    },
    "5": {
      "price": 1,
      "occupancy": 1,
      "sample": 16
    }
  },
  "seasonality": {
    "1": {
      "price": 0.897,
      "occupancy": 0.878
    },
    "2": {
      "price": 0.989,
      "occupancy": 0.889
    },
    "3": {
      "price": 1.081,
      "occupancy": 1.056
    },
    "4": {
      "price": 1.078,
      "occupancy": 0.966
    },
    "5": {
      "price": 1.138,
      "occupancy": 1.145
    },
    "6": {
      "price": 1.221,
      "occupancy": 1.095
    },
    "7": {
      "price": 1.014,
      "occupancy": 0.83
    },
    "8": {
      "price": 0.942,
      "occupancy": 0.948
    },
    "9": {
      "price": 1.257,
      "occupancy": 1.186
    },
    "10": {
      "price": 0.866,
      "occupancy": 1.028
    },
    "11": {
      "price": 0.712,
      "occupancy": 1.017
    },
    "12": {
      "price": 0.805,
      "occupancy": 0.962
    }
  },
  "arrondissements": {
    "1": {
      "priceIndex": 1.476,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 0.955,
          "occupancyIndex": 1.0,
          "sample": 510
        },
        "sud": {
          "index": 1.038,
          "occupancyIndex": 1.0,
          "sample": 1672
        },
        "est": {
          "index": 0.909,
          "occupancyIndex": 0.98,
          "sample": 1844
        },
        "ouest": {
          "index": 1.071,
          "occupancyIndex": 1.0,
          "sample": 2543
        }
      },
      "buckets": {
        "0": {
          "price": 177,
          "occupancy": 0.512,
          "occupancyTop": 0.699,
          "sample": 175
        },
        "1": {
          "price": 242,
          "occupancy": 0.37,
          "occupancyTop": 0.685,
          "sample": 282
        },
        "2": {
          "price": 423,
          "occupancy": 0.47,
          "occupancyTop": 0.699,
          "sample": 182
        },
        "3": {
          "price": 565,
          "occupancy": 0.485,
          "occupancyTop": 0.699,
          "sample": 78
        }
      }
    },
    "2": {
      "priceIndex": 1.231,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 0.952,
          "occupancyIndex": 1.0,
          "sample": 1485
        },
        "sud": {
          "index": 0.978,
          "occupancyIndex": 1.0,
          "sample": 2732
        },
        "est": {
          "index": 0.98,
          "occupancyIndex": 1.0,
          "sample": 3119
        },
        "ouest": {
          "index": 1.071,
          "occupancyIndex": 1.0,
          "sample": 3729
        }
      },
      "buckets": {
        "0": {
          "price": 148,
          "occupancy": 0.512,
          "occupancyTop": 0.699,
          "sample": 273
        },
        "1": {
          "price": 212,
          "occupancy": 0.37,
          "occupancyTop": 0.699,
          "sample": 444
        },
        "2": {
          "price": 332,
          "occupancy": 0.455,
          "occupancyTop": 0.699,
          "sample": 273
        },
        "3": {
          "price": 476,
          "occupancy": 0.512,
          "occupancyTop": 0.699,
          "sample": 202
        }
      }
    },
    "3": {
      "priceIndex": 1.238,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 0.938,
          "occupancyIndex": 1.0,
          "sample": 3392
        },
        "sud": {
          "index": 1.09,
          "occupancyIndex": 1.0,
          "sample": 2558
        },
        "est": {
          "index": 1.022,
          "occupancyIndex": 1.0,
          "sample": 3096
        },
        "ouest": {
          "index": 0.985,
          "occupancyIndex": 1.0,
          "sample": 3359
        }
      },
      "buckets": {
        "0": {
          "price": 149,
          "occupancy": 0.427,
          "occupancyTop": 0.699,
          "sample": 295
        },
        "1": {
          "price": 207,
          "occupancy": 0.342,
          "occupancyTop": 0.685,
          "sample": 556
        },
        "2": {
          "price": 333,
          "occupancy": 0.427,
          "occupancyTop": 0.699,
          "sample": 290
        },
        "3": {
          "price": 491,
          "occupancy": 0.4,
          "occupancyTop": 0.699,
          "sample": 182
        }
      }
    },
    "4": {
      "priceIndex": 1.319,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 1.029,
          "occupancyIndex": 1.02,
          "sample": 1997
        },
        "sud": {
          "index": 1.032,
          "occupancyIndex": 0.9,
          "sample": 1348
        },
        "est": {
          "index": 0.965,
          "occupancyIndex": 1.0,
          "sample": 2840
        },
        "ouest": {
          "index": 1.001,
          "occupancyIndex": 1.02,
          "sample": 1740
        }
      },
      "buckets": {
        "0": {
          "price": 155,
          "occupancy": 0.441,
          "occupancyTop": 0.699,
          "sample": 218
        },
        "1": {
          "price": 222,
          "occupancy": 0.342,
          "occupancyTop": 0.57,
          "sample": 351
        },
        "2": {
          "price": 361,
          "occupancy": 0.349,
          "occupancyTop": 0.685,
          "sample": 202
        },
        "3": {
          "price": 489,
          "occupancy": 0.356,
          "occupancyTop": 0.699,
          "sample": 76
        }
      }
    },
    "5": {
      "priceIndex": 1.151,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 1.152,
          "occupancyIndex": 1.1,
          "sample": 2854
        },
        "sud": {
          "index": 0.885,
          "occupancyIndex": 0.9,
          "sample": 2110
        },
        "est": {
          "index": 0.949,
          "occupancyIndex": 1.044,
          "sample": 1512
        },
        "ouest": {
          "index": 0.998,
          "occupancyIndex": 0.952,
          "sample": 1041
        }
      },
      "buckets": {
        "0": {
          "price": 141,
          "occupancy": 0.37,
          "occupancyTop": 0.655,
          "sample": 177
        },
        "1": {
          "price": 194,
          "occupancy": 0.312,
          "occupancyTop": 0.57,
          "sample": 314
        },
        "2": {
          "price": 306,
          "occupancy": 0.342,
          "occupancyTop": 0.575,
          "sample": 182
        },
        "3": {
          "price": 437,
          "occupancy": 0.37,
          "occupancyTop": 0.699,
          "sample": 87
        }
      }
    },
    "6": {
      "priceIndex": 1.409,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 1.061,
          "occupancyIndex": 0.958,
          "sample": 1697
        },
        "sud": {
          "index": 0.94,
          "occupancyIndex": 0.9,
          "sample": 1207
        },
        "est": {
          "index": 1.076,
          "occupancyIndex": 1.067,
          "sample": 1803
        },
        "ouest": {
          "index": 0.92,
          "occupancyIndex": 1.046,
          "sample": 1792
        }
      },
      "buckets": {
        "0": {
          "price": 157,
          "occupancy": 0.4,
          "occupancyTop": 0.699,
          "sample": 174
        },
        "1": {
          "price": 245,
          "occupancy": 0.312,
          "occupancyTop": 0.655,
          "sample": 291
        },
        "2": {
          "price": 391,
          "occupancy": 0.312,
          "occupancyTop": 0.597,
          "sample": 161
        },
        "3": {
          "price": 549,
          "occupancy": 0.285,
          "occupancyTop": 0.655,
          "sample": 73
        }
      }
    },
    "7": {
      "priceIndex": 1.392,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 0.983,
          "occupancyIndex": 1.0,
          "sample": 1030
        },
        "sud": {
          "index": 0.93,
          "occupancyIndex": 0.98,
          "sample": 1072
        },
        "est": {
          "index": 1.055,
          "occupancyIndex": 0.937,
          "sample": 1815
        },
        "ouest": {
          "index": 1.0,
          "occupancyIndex": 1.0,
          "sample": 2140
        }
      },
      "buckets": {
        "0": {
          "price": 160,
          "occupancy": 0.414,
          "occupancyTop": 0.699,
          "sample": 134
        },
        "1": {
          "price": 231,
          "occupancy": 0.342,
          "occupancyTop": 0.685,
          "sample": 284
        },
        "2": {
          "price": 384,
          "occupancy": 0.37,
          "occupancyTop": 0.699,
          "sample": 131
        },
        "3": {
          "price": 624,
          "occupancy": 0.271,
          "occupancyTop": 0.685,
          "sample": 64
        }
      }
    },
    "8": {
      "priceIndex": 1.381,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 0.784,
          "occupancyIndex": 1.0,
          "sample": 1075
        },
        "sud": {
          "index": 1.095,
          "occupancyIndex": 1.0,
          "sample": 967
        },
        "est": {
          "index": 0.975,
          "occupancyIndex": 1.0,
          "sample": 2866
        },
        "ouest": {
          "index": 1.084,
          "occupancyIndex": 1.0,
          "sample": 2849
        }
      },
      "buckets": {
        "0": {
          "price": 160,
          "occupancy": 0.485,
          "occupancyTop": 0.699,
          "sample": 185
        },
        "1": {
          "price": 226,
          "occupancy": 0.37,
          "occupancyTop": 0.699,
          "sample": 290
        },
        "2": {
          "price": 386,
          "occupancy": 0.485,
          "occupancyTop": 0.699,
          "sample": 228
        },
        "3": {
          "price": 567,
          "occupancy": 0.4,
          "occupancyTop": 0.699,
          "sample": 125
        }
      }
    },
    "9": {
      "priceIndex": 1.035,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 0.97,
          "occupancyIndex": 0.98,
          "sample": 1596
        },
        "sud": {
          "index": 1.108,
          "occupancyIndex": 1.0,
          "sample": 2157
        },
        "est": {
          "index": 0.899,
          "occupancyIndex": 1.0,
          "sample": 2609
        },
        "ouest": {
          "index": 1.06,
          "occupancyIndex": 1.0,
          "sample": 3337
        }
      },
      "buckets": {
        "0": {
          "price": 132,
          "occupancy": 0.512,
          "occupancyTop": 0.699,
          "sample": 239
        },
        "1": {
          "price": 171,
          "occupancy": 0.321,
          "occupancyTop": 0.685,
          "sample": 420
        },
        "2": {
          "price": 272,
          "occupancy": 0.385,
          "occupancyTop": 0.699,
          "sample": 216
        },
        "3": {
          "price": 413,
          "occupancy": 0.441,
          "occupancyTop": 0.699,
          "sample": 106
        }
      }
    },
    "10": {
      "priceIndex": 0.923,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 0.902,
          "occupancyIndex": 0.9,
          "sample": 3842
        },
        "sud": {
          "index": 1.104,
          "occupancyIndex": 1.02,
          "sample": 2375
        },
        "est": {
          "index": 0.959,
          "occupancyIndex": 0.9,
          "sample": 3645
        },
        "ouest": {
          "index": 1.076,
          "occupancyIndex": 1.02,
          "sample": 4264
        }
      },
      "buckets": {
        "0": {
          "price": 116,
          "occupancy": 0.4,
          "occupancyTop": 0.699,
          "sample": 329
        },
        "1": {
          "price": 151,
          "occupancy": 0.312,
          "occupancyTop": 0.57,
          "sample": 632
        },
        "2": {
          "price": 246,
          "occupancy": 0.342,
          "occupancyTop": 0.699,
          "sample": 331
        },
        "3": {
          "price": 375,
          "occupancy": 0.427,
          "occupancyTop": 0.699,
          "sample": 167
        }
      }
    },
    "11": {
      "priceIndex": 0.913,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 0.942,
          "occupancyIndex": 0.952,
          "sample": 5887
        },
        "sud": {
          "index": 1.034,
          "occupancyIndex": 1.1,
          "sample": 4978
        },
        "est": {
          "index": 0.936,
          "occupancyIndex": 0.908,
          "sample": 3756
        },
        "ouest": {
          "index": 1.182,
          "occupancyIndex": 1.0,
          "sample": 2881
        }
      },
      "buckets": {
        "0": {
          "price": 117,
          "occupancy": 0.4,
          "occupancyTop": 0.699,
          "sample": 411
        },
        "1": {
          "price": 149,
          "occupancy": 0.312,
          "occupancyTop": 0.542,
          "sample": 890
        },
        "2": {
          "price": 242,
          "occupancy": 0.37,
          "occupancyTop": 0.699,
          "sample": 333
        },
        "3": {
          "price": 334,
          "occupancy": 0.312,
          "occupancyTop": 0.627,
          "sample": 158
        }
      }
    },
    "12": {
      "priceIndex": 0.816,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 1.071,
          "occupancyIndex": 0.9,
          "sample": 403
        },
        "sud": {
          "index": 0.911,
          "occupancyIndex": 0.9,
          "sample": 1531
        },
        "est": {
          "index": 0.928,
          "occupancyIndex": 0.9,
          "sample": 2050
        },
        "ouest": {
          "index": 1.098,
          "occupancyIndex": 1.0,
          "sample": 3234
        }
      },
      "buckets": {
        "0": {
          "price": 105,
          "occupancy": 0.455,
          "occupancyTop": 0.699,
          "sample": 193
        },
        "1": {
          "price": 137,
          "occupancy": 0.342,
          "occupancyTop": 0.655,
          "sample": 373
        },
        "2": {
          "price": 202,
          "occupancy": 0.342,
          "occupancyTop": 0.685,
          "sample": 129
        },
        "3": {
          "price": 299,
          "occupancy": 0.312,
          "occupancyTop": 0.597,
          "sample": 65
        }
      }
    },
    "13": {
      "priceIndex": 0.798,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 1.104,
          "occupancyIndex": 0.952,
          "sample": 1490
        },
        "sud": {
          "index": 0.92,
          "occupancyIndex": 1.0,
          "sample": 1016
        },
        "est": {
          "index": 0.982,
          "occupancyIndex": 1.1,
          "sample": 1435
        },
        "ouest": {
          "index": 0.973,
          "occupancyIndex": 1.1,
          "sample": 1428
        }
      },
      "buckets": {
        "0": {
          "price": 104,
          "occupancy": 0.385,
          "occupancyTop": 0.655,
          "sample": 142
        },
        "1": {
          "price": 134,
          "occupancy": 0.312,
          "occupancyTop": 0.57,
          "sample": 251
        },
        "2": {
          "price": 198,
          "occupancy": 0.37,
          "occupancyTop": 0.57,
          "sample": 91
        },
        "3": {
          "price": 262,
          "occupancy": 0.312,
          "occupancyTop": 0.542,
          "sample": 45
        }
      }
    },
    "14": {
      "priceIndex": 0.854,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 1.143,
          "occupancyIndex": 0.952,
          "sample": 1782
        },
        "sud": {
          "index": 0.936,
          "occupancyIndex": 1.0,
          "sample": 1421
        },
        "est": {
          "index": 0.988,
          "occupancyIndex": 0.9,
          "sample": 1481
        },
        "ouest": {
          "index": 0.93,
          "occupancyIndex": 1.1,
          "sample": 1585
        }
      },
      "buckets": {
        "0": {
          "price": 110,
          "occupancy": 0.37,
          "occupancyTop": 0.699,
          "sample": 166
        },
        "1": {
          "price": 141,
          "occupancy": 0.312,
          "occupancyTop": 0.627,
          "sample": 282
        },
        "2": {
          "price": 218,
          "occupancy": 0.312,
          "occupancyTop": 0.685,
          "sample": 119
        },
        "3": {
          "price": 324,
          "occupancy": 0.227,
          "occupancyTop": 0.4,
          "sample": 55
        }
      }
    },
    "15": {
      "priceIndex": 0.996,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 1.191,
          "occupancyIndex": 1.0,
          "sample": 4346
        },
        "sud": {
          "index": 0.861,
          "occupancyIndex": 1.0,
          "sample": 3907
        },
        "est": {
          "index": 0.989,
          "occupancyIndex": 1.0,
          "sample": 3962
        },
        "ouest": {
          "index": 0.985,
          "occupancyIndex": 0.9,
          "sample": 3063
        }
      },
      "buckets": {
        "0": {
          "price": 124,
          "occupancy": 0.455,
          "occupancyTop": 0.699,
          "sample": 406
        },
        "1": {
          "price": 163,
          "occupancy": 0.342,
          "occupancyTop": 0.655,
          "sample": 685
        },
        "2": {
          "price": 264,
          "occupancy": 0.37,
          "occupancyTop": 0.685,
          "sample": 313
        },
        "3": {
          "price": 406,
          "occupancy": 0.312,
          "occupancyTop": 0.627,
          "sample": 138
        }
      }
    },
    "16": {
      "priceIndex": 1.142,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 1.073,
          "occupancyIndex": 1.096,
          "sample": 3103
        },
        "sud": {
          "index": 0.876,
          "occupancyIndex": 0.908,
          "sample": 3988
        },
        "est": {
          "index": 1.187,
          "occupancyIndex": 1.1,
          "sample": 2153
        },
        "ouest": {
          "index": 0.938,
          "occupancyIndex": 0.9,
          "sample": 1180
        }
      },
      "buckets": {
        "0": {
          "price": 130,
          "occupancy": 0.485,
          "occupancyTop": 0.699,
          "sample": 222
        },
        "1": {
          "price": 188,
          "occupancy": 0.285,
          "occupancyTop": 0.57,
          "sample": 400
        },
        "2": {
          "price": 321,
          "occupancy": 0.285,
          "occupancyTop": 0.512,
          "sample": 307
        },
        "3": {
          "price": 506,
          "occupancy": 0.258,
          "occupancyTop": 0.542,
          "sample": 138
        }
      }
    },
    "17": {
      "priceIndex": 0.916,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 0.85,
          "occupancyIndex": 1.02,
          "sample": 2138
        },
        "sud": {
          "index": 1.057,
          "occupancyIndex": 1,
          "sample": 404
        },
        "est": {
          "index": 0.914,
          "occupancyIndex": 0.9,
          "sample": 3180
        },
        "ouest": {
          "index": 1.129,
          "occupancyIndex": 1.02,
          "sample": 4917
        }
      },
      "buckets": {
        "0": {
          "price": 115,
          "occupancy": 0.512,
          "occupancyTop": 0.699,
          "sample": 257
        },
        "1": {
          "price": 150,
          "occupancy": 0.312,
          "occupancyTop": 0.57,
          "sample": 495
        },
        "2": {
          "price": 237,
          "occupancy": 0.342,
          "occupancyTop": 0.685,
          "sample": 204
        },
        "3": {
          "price": 382,
          "occupancy": 0.285,
          "occupancyTop": 0.699,
          "sample": 101
        }
      }
    },
    "18": {
      "priceIndex": 0.819,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 0.932,
          "occupancyIndex": 1.0,
          "sample": 3868
        },
        "sud": {
          "index": 1.169,
          "occupancyIndex": 1.1,
          "sample": 3855
        },
        "est": {
          "index": 0.896,
          "occupancyIndex": 0.952,
          "sample": 6106
        },
        "ouest": {
          "index": 1.097,
          "occupancyIndex": 1.048,
          "sample": 4905
        }
      },
      "buckets": {
        "0": {
          "price": 105,
          "occupancy": 0.4,
          "occupancyTop": 0.699,
          "sample": 433
        },
        "1": {
          "price": 136,
          "occupancy": 0.312,
          "occupancyTop": 0.542,
          "sample": 991
        },
        "2": {
          "price": 208,
          "occupancy": 0.342,
          "occupancyTop": 0.597,
          "sample": 318
        },
        "3": {
          "price": 306,
          "occupancy": 0.285,
          "occupancyTop": 0.542,
          "sample": 108
        }
      }
    },
    "19": {
      "priceIndex": 0.715,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 0.965,
          "occupancyIndex": 1.059,
          "sample": 2500
        },
        "sud": {
          "index": 1.07,
          "occupancyIndex": 0.9,
          "sample": 2068
        },
        "est": {
          "index": 0.998,
          "occupancyIndex": 1.1,
          "sample": 2103
        },
        "ouest": {
          "index": 0.994,
          "occupancyIndex": 0.947,
          "sample": 1603
        }
      },
      "buckets": {
        "0": {
          "price": 97,
          "occupancy": 0.37,
          "occupancyTop": 0.699,
          "sample": 180
        },
        "1": {
          "price": 119,
          "occupancy": 0.258,
          "occupancyTop": 0.455,
          "sample": 396
        },
        "2": {
          "price": 166,
          "occupancy": 0.258,
          "occupancyTop": 0.512,
          "sample": 176
        },
        "3": {
          "price": 257,
          "occupancy": 0.258,
          "occupancyTop": 0.4,
          "sample": 79
        }
      }
    },
    "20": {
      "priceIndex": 0.685,
      "priceTrend": null,
      "sectors": {
        "nord": {
          "index": 0.981,
          "occupancyIndex": 0.9,
          "sample": 1743
        },
        "sud": {
          "index": 0.993,
          "occupancyIndex": 1.1,
          "sample": 3181
        },
        "est": {
          "index": 0.97,
          "occupancyIndex": 0.944,
          "sample": 1098
        },
        "ouest": {
          "index": 1.032,
          "occupancyIndex": 0.944,
          "sample": 2507
        }
      },
      "buckets": {
        "0": {
          "price": 91,
          "occupancy": 0.395,
          "occupancyTop": 0.655,
          "sample": 233
        },
        "1": {
          "price": 113,
          "occupancy": 0.285,
          "occupancyTop": 0.485,
          "sample": 414
        },
        "2": {
          "price": 163,
          "occupancy": 0.258,
          "occupancyTop": 0.485,
          "sample": 139
        },
        "3": {
          "price": 253,
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
      "listings": 2683,
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
          "price": 76,
          "occupancy": 0.345,
          "occupancyTop": 0.674,
          "sample": 761
        },
        "1": {
          "price": 97,
          "occupancy": 0.296,
          "occupancyTop": 0.575,
          "sample": 1181
        },
        "2": {
          "price": 141,
          "occupancy": 0.263,
          "occupancyTop": 0.493,
          "sample": 497
        },
        "3": {
          "price": 223,
          "occupancy": 0.214,
          "occupancyTop": 0.444,
          "sample": 244
        }
      },
      "seasonality": {
        "1": {
          "price": 0.931,
          "occupancy": 0.902
        },
        "2": {
          "price": 1.016,
          "occupancy": 0.913
        },
        "3": {
          "price": 1.1,
          "occupancy": 0.987
        },
        "4": {
          "price": 1.096,
          "occupancy": 0.983
        },
        "5": {
          "price": 1.094,
          "occupancy": 1.03
        },
        "6": {
          "price": 1.106,
          "occupancy": 0.988
        },
        "7": {
          "price": 1.041,
          "occupancy": 0.83
        },
        "8": {
          "price": 1.053,
          "occupancy": 1.08
        },
        "9": {
          "price": 1.134,
          "occupancy": 1.204
        },
        "10": {
          "price": 0.82,
          "occupancy": 1.051
        },
        "11": {
          "price": 0.762,
          "occupancy": 1.102
        },
        "12": {
          "price": 0.847,
          "occupancy": 0.93
        }
      }
    },
    "bordeaux": {
      "label": "Bordeaux",
      "snapshot": "2026-09-17",
      "snapshots": 9,
      "listings": 3584,
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
          "occupancy": 0.263,
          "occupancyTop": 0.542,
          "sample": 761
        },
        "1": {
          "price": 96,
          "occupancy": 0.23,
          "occupancyTop": 0.444,
          "sample": 1373
        },
        "2": {
          "price": 139,
          "occupancy": 0.197,
          "occupancyTop": 0.378,
          "sample": 763
        },
        "3": {
          "price": 248,
          "occupancy": 0.148,
          "occupancyTop": 0.279,
          "sample": 687
        }
      },
      "seasonality": {
        "1": {
          "price": 0.906,
          "occupancy": 0.902
        },
        "2": {
          "price": 0.976,
          "occupancy": 0.906
        },
        "3": {
          "price": 1.046,
          "occupancy": 0.955
        },
        "4": {
          "price": 1.067,
          "occupancy": 1.008
        },
        "5": {
          "price": 1.097,
          "occupancy": 1.061
        },
        "6": {
          "price": 1.099,
          "occupancy": 1.012
        },
        "7": {
          "price": 1.127,
          "occupancy": 1.007
        },
        "8": {
          "price": 1.131,
          "occupancy": 1.08
        },
        "9": {
          "price": 1.121,
          "occupancy": 1.124
        },
        "10": {
          "price": 0.827,
          "occupancy": 0.984
        },
        "11": {
          "price": 0.767,
          "occupancy": 0.99
        },
        "12": {
          "price": 0.837,
          "occupancy": 0.97
        }
      }
    },
    "pays-basque": {
      "label": "Pays basque",
      "snapshot": "2026-09-19",
      "snapshots": 9,
      "listings": 4497,
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
          "price": 88,
          "occupancy": 0.197,
          "occupancyTop": 0.329,
          "sample": 765
        },
        "1": {
          "price": 99,
          "occupancy": 0.181,
          "occupancyTop": 0.312,
          "sample": 1524
        },
        "2": {
          "price": 129,
          "occupancy": 0.164,
          "occupancyTop": 0.268,
          "sample": 1170
        },
        "3": {
          "price": 251,
          "occupancy": 0.115,
          "occupancyTop": 0.197,
          "sample": 1038
        }
      },
      "seasonality": {
        "1": {
          "price": 0.877,
          "occupancy": 0.924
        },
        "2": {
          "price": 0.933,
          "occupancy": 0.893
        },
        "3": {
          "price": 0.99,
          "occupancy": 1.04
        },
        "4": {
          "price": 1.032,
          "occupancy": 0.994
        },
        "5": {
          "price": 1.026,
          "occupancy": 0.958
        },
        "6": {
          "price": 1.073,
          "occupancy": 1.066
        },
        "7": {
          "price": 1.302,
          "occupancy": 1.323
        },
        "8": {
          "price": 1.282,
          "occupancy": 1.009
        },
        "9": {
          "price": 1.069,
          "occupancy": 0.995
        },
        "10": {
          "price": 0.831,
          "occupancy": 0.865
        },
        "11": {
          "price": 0.765,
          "occupancy": 0.932
        },
        "12": {
          "price": 0.821,
          "occupancy": 1.002
        }
      }
    }
  },
  "nationalModel": {
    "price": {
      "a": -1.1618,
      "b": 0.6776,
      "r2": 0.88,
      "residualSd": 0.115,
      "zones": 71,
      "crossValidationError": {
        "Paris": 0.137,
        "bordeaux": 0.059,
        "lyon": 0.1,
        "pays-basque": 0.054
      }
    },
    "buckets": {
      "0": {
        "ratio": 0.791,
        "occupancy": 0.304,
        "occupancyTop": 0.608
      },
      "1": {
        "ratio": 1.0,
        "occupancy": 0.263,
        "occupancyTop": 0.509
      },
      "2": {
        "ratio": 1.448,
        "occupancy": 0.23,
        "occupancyTop": 0.435
      },
      "3": {
        "ratio": 2.533,
        "occupancy": 0.181,
        "occupancyTop": 0.362
      }
    },
    "bucketsIdf": {
      "0": {
        "occupancy": 0.427,
        "occupancyTop": 0.699
      },
      "1": {
        "occupancy": 0.312,
        "occupancyTop": 0.597
      },
      "2": {
        "occupancy": 0.342,
        "occupancyTop": 0.699
      },
      "3": {
        "occupancy": 0.342,
        "occupancyTop": 0.699
      }
    },
    "priceSeasonSlope": 0.797,
    "seasonality": {
      "FRC2": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.551,
            "price": 0.642
          },
          "2": {
            "occupancy": 0.927,
            "price": 0.942
          },
          "3": {
            "occupancy": 0.556,
            "price": 0.646
          },
          "4": {
            "occupancy": 0.861,
            "price": 0.889
          },
          "5": {
            "occupancy": 1.056,
            "price": 1.045
          },
          "6": {
            "occupancy": 0.991,
            "price": 0.993
          },
          "7": {
            "occupancy": 1.759,
            "price": 1.605
          },
          "8": {
            "occupancy": 2.068,
            "price": 1.851
          },
          "9": {
            "occupancy": 0.784,
            "price": 0.828
          },
          "10": {
            "occupancy": 0.835,
            "price": 0.868
          },
          "11": {
            "occupancy": 0.538,
            "price": 0.632
          },
          "12": {
            "occupancy": 1.073,
            "price": 1.058
          }
        }
      },
      "FRB0": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.413,
            "price": 0.532
          },
          "2": {
            "occupancy": 0.504,
            "price": 0.605
          },
          "3": {
            "occupancy": 0.532,
            "price": 0.627
          },
          "4": {
            "occupancy": 1.137,
            "price": 1.109
          },
          "5": {
            "occupancy": 1.296,
            "price": 1.236
          },
          "6": {
            "occupancy": 1.088,
            "price": 1.07
          },
          "7": {
            "occupancy": 1.692,
            "price": 1.552
          },
          "8": {
            "occupancy": 2.022,
            "price": 1.815
          },
          "9": {
            "occupancy": 0.906,
            "price": 0.925
          },
          "10": {
            "occupancy": 0.984,
            "price": 0.987
          },
          "11": {
            "occupancy": 0.59,
            "price": 0.673
          },
          "12": {
            "occupancy": 0.835,
            "price": 0.868
          }
        }
      },
      "FRI3": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.286,
            "price": 0.431
          },
          "2": {
            "occupancy": 0.379,
            "price": 0.505
          },
          "3": {
            "occupancy": 0.4,
            "price": 0.522
          },
          "4": {
            "occupancy": 0.969,
            "price": 0.975
          },
          "5": {
            "occupancy": 1.083,
            "price": 1.066
          },
          "6": {
            "occupancy": 0.986,
            "price": 0.989
          },
          "7": {
            "occupancy": 2.336,
            "price": 2.065
          },
          "8": {
            "occupancy": 3.125,
            "price": 2.694
          },
          "9": {
            "occupancy": 0.808,
            "price": 0.847
          },
          "10": {
            "occupancy": 0.679,
            "price": 0.744
          },
          "11": {
            "occupancy": 0.385,
            "price": 0.51
          },
          "12": {
            "occupancy": 0.566,
            "price": 0.654
          }
        }
      },
      "FRM0": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.041,
            "price": 0.236
          },
          "2": {
            "occupancy": 0.056,
            "price": 0.248
          },
          "3": {
            "occupancy": 0.069,
            "price": 0.258
          },
          "4": {
            "occupancy": 0.625,
            "price": 0.701
          },
          "5": {
            "occupancy": 0.84,
            "price": 0.872
          },
          "6": {
            "occupancy": 1.574,
            "price": 1.457
          },
          "7": {
            "occupancy": 2.952,
            "price": 2.556
          },
          "8": {
            "occupancy": 3.48,
            "price": 2.977
          },
          "9": {
            "occupancy": 1.489,
            "price": 1.39
          },
          "10": {
            "occupancy": 0.715,
            "price": 0.773
          },
          "11": {
            "occupancy": 0.068,
            "price": 0.257
          },
          "12": {
            "occupancy": 0.091,
            "price": 0.276
          }
        }
      },
      "FRJ2": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.646,
            "price": 0.718
          },
          "2": {
            "occupancy": 1.095,
            "price": 1.076
          },
          "3": {
            "occupancy": 0.668,
            "price": 0.735
          },
          "4": {
            "occupancy": 0.724,
            "price": 0.78
          },
          "5": {
            "occupancy": 0.837,
            "price": 0.87
          },
          "6": {
            "occupancy": 0.822,
            "price": 0.858
          },
          "7": {
            "occupancy": 1.783,
            "price": 1.624
          },
          "8": {
            "occupancy": 2.504,
            "price": 2.199
          },
          "9": {
            "occupancy": 0.731,
            "price": 0.786
          },
          "10": {
            "occupancy": 0.732,
            "price": 0.786
          },
          "11": {
            "occupancy": 0.458,
            "price": 0.568
          },
          "12": {
            "occupancy": 1.0,
            "price": 1.0
          }
        }
      },
      "FRY4": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.913,
            "price": 0.931
          },
          "2": {
            "occupancy": 0.758,
            "price": 0.807
          },
          "3": {
            "occupancy": 0.738,
            "price": 0.791
          },
          "4": {
            "occupancy": 0.882,
            "price": 0.906
          },
          "5": {
            "occupancy": 0.87,
            "price": 0.896
          },
          "6": {
            "occupancy": 0.609,
            "price": 0.688
          },
          "7": {
            "occupancy": 1.245,
            "price": 1.195
          },
          "8": {
            "occupancy": 1.149,
            "price": 1.119
          },
          "9": {
            "occupancy": 0.957,
            "price": 0.966
          },
          "10": {
            "occupancy": 1.424,
            "price": 1.338
          },
          "11": {
            "occupancy": 1.304,
            "price": 1.242
          },
          "12": {
            "occupancy": 1.15,
            "price": 1.12
          }
        }
      },
      "FRI2": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.394,
            "price": 0.517
          },
          "2": {
            "occupancy": 0.492,
            "price": 0.595
          },
          "3": {
            "occupancy": 0.519,
            "price": 0.617
          },
          "4": {
            "occupancy": 0.861,
            "price": 0.889
          },
          "5": {
            "occupancy": 1.084,
            "price": 1.067
          },
          "6": {
            "occupancy": 0.988,
            "price": 0.99
          },
          "7": {
            "occupancy": 1.969,
            "price": 1.772
          },
          "8": {
            "occupancy": 2.676,
            "price": 2.336
          },
          "9": {
            "occupancy": 0.85,
            "price": 0.88
          },
          "10": {
            "occupancy": 0.831,
            "price": 0.865
          },
          "11": {
            "occupancy": 0.547,
            "price": 0.639
          },
          "12": {
            "occupancy": 0.789,
            "price": 0.832
          }
        }
      },
      "FRF2": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.47,
            "price": 0.578
          },
          "2": {
            "occupancy": 0.531,
            "price": 0.626
          },
          "3": {
            "occupancy": 0.571,
            "price": 0.658
          },
          "4": {
            "occupancy": 1.035,
            "price": 1.028
          },
          "5": {
            "occupancy": 1.247,
            "price": 1.197
          },
          "6": {
            "occupancy": 1.132,
            "price": 1.105
          },
          "7": {
            "occupancy": 1.552,
            "price": 1.44
          },
          "8": {
            "occupancy": 1.692,
            "price": 1.552
          },
          "9": {
            "occupancy": 1.012,
            "price": 1.01
          },
          "10": {
            "occupancy": 1.071,
            "price": 1.057
          },
          "11": {
            "occupancy": 0.698,
            "price": 0.759
          },
          "12": {
            "occupancy": 0.989,
            "price": 0.991
          }
        }
      },
      "FRF3": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.649,
            "price": 0.72
          },
          "2": {
            "occupancy": 0.962,
            "price": 0.97
          },
          "3": {
            "occupancy": 0.552,
            "price": 0.643
          },
          "4": {
            "occupancy": 0.966,
            "price": 0.973
          },
          "5": {
            "occupancy": 1.041,
            "price": 1.033
          },
          "6": {
            "occupancy": 0.991,
            "price": 0.993
          },
          "7": {
            "occupancy": 1.442,
            "price": 1.352
          },
          "8": {
            "occupancy": 1.749,
            "price": 1.597
          },
          "9": {
            "occupancy": 0.796,
            "price": 0.837
          },
          "10": {
            "occupancy": 0.91,
            "price": 0.928
          },
          "11": {
            "occupancy": 0.581,
            "price": 0.666
          },
          "12": {
            "occupancy": 1.361,
            "price": 1.288
          }
        }
      },
      "FRD1": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.267,
            "price": 0.416
          },
          "2": {
            "occupancy": 0.394,
            "price": 0.517
          },
          "3": {
            "occupancy": 0.37,
            "price": 0.498
          },
          "4": {
            "occupancy": 1.064,
            "price": 1.051
          },
          "5": {
            "occupancy": 1.246,
            "price": 1.196
          },
          "6": {
            "occupancy": 1.136,
            "price": 1.108
          },
          "7": {
            "occupancy": 2.188,
            "price": 1.947
          },
          "8": {
            "occupancy": 2.639,
            "price": 2.306
          },
          "9": {
            "occupancy": 0.841,
            "price": 0.873
          },
          "10": {
            "occupancy": 0.781,
            "price": 0.825
          },
          "11": {
            "occupancy": 0.411,
            "price": 0.531
          },
          "12": {
            "occupancy": 0.665,
            "price": 0.733
          }
        }
      },
      "FRD2": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.416,
            "price": 0.535
          },
          "2": {
            "occupancy": 0.509,
            "price": 0.609
          },
          "3": {
            "occupancy": 0.516,
            "price": 0.614
          },
          "4": {
            "occupancy": 1.069,
            "price": 1.055
          },
          "5": {
            "occupancy": 1.203,
            "price": 1.162
          },
          "6": {
            "occupancy": 1.064,
            "price": 1.051
          },
          "7": {
            "occupancy": 1.868,
            "price": 1.692
          },
          "8": {
            "occupancy": 2.227,
            "price": 1.978
          },
          "9": {
            "occupancy": 0.869,
            "price": 0.896
          },
          "10": {
            "occupancy": 0.89,
            "price": 0.912
          },
          "11": {
            "occupancy": 0.572,
            "price": 0.659
          },
          "12": {
            "occupancy": 0.797,
            "price": 0.838
          }
        }
      },
      "FR10": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.719,
            "price": 0.776
          },
          "2": {
            "occupancy": 0.682,
            "price": 0.747
          },
          "3": {
            "occupancy": 0.829,
            "price": 0.864
          },
          "4": {
            "occupancy": 1.187,
            "price": 1.149
          },
          "5": {
            "occupancy": 1.123,
            "price": 1.098
          },
          "6": {
            "occupancy": 1.277,
            "price": 1.221
          },
          "7": {
            "occupancy": 1.234,
            "price": 1.186
          },
          "8": {
            "occupancy": 1.086,
            "price": 1.069
          },
          "9": {
            "occupancy": 1.003,
            "price": 1.002
          },
          "10": {
            "occupancy": 1.118,
            "price": 1.094
          },
          "11": {
            "occupancy": 0.777,
            "price": 0.822
          },
          "12": {
            "occupancy": 0.964,
            "price": 0.971
          }
        }
      },
      "FRF1": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.421,
            "price": 0.539
          },
          "2": {
            "occupancy": 0.449,
            "price": 0.561
          },
          "3": {
            "occupancy": 0.472,
            "price": 0.579
          },
          "4": {
            "occupancy": 1.004,
            "price": 1.003
          },
          "5": {
            "occupancy": 1.029,
            "price": 1.023
          },
          "6": {
            "occupancy": 0.995,
            "price": 0.996
          },
          "7": {
            "occupancy": 1.357,
            "price": 1.285
          },
          "8": {
            "occupancy": 1.542,
            "price": 1.432
          },
          "9": {
            "occupancy": 0.859,
            "price": 0.888
          },
          "10": {
            "occupancy": 1.022,
            "price": 1.018
          },
          "11": {
            "occupancy": 0.782,
            "price": 0.826
          },
          "12": {
            "occupancy": 2.068,
            "price": 1.851
          }
        }
      },
      "FRY2": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 1.515,
            "price": 1.41
          },
          "2": {
            "occupancy": 1.703,
            "price": 1.56
          },
          "3": {
            "occupancy": 1.396,
            "price": 1.316
          },
          "4": {
            "occupancy": 1.325,
            "price": 1.259
          },
          "5": {
            "occupancy": 0.603,
            "price": 0.684
          },
          "6": {
            "occupancy": 0.442,
            "price": 0.555
          },
          "7": {
            "occupancy": 1.1,
            "price": 1.08
          },
          "8": {
            "occupancy": 1.061,
            "price": 1.049
          },
          "9": {
            "occupancy": 0.282,
            "price": 0.428
          },
          "10": {
            "occupancy": 0.559,
            "price": 0.649
          },
          "11": {
            "occupancy": 0.704,
            "price": 0.764
          },
          "12": {
            "occupancy": 1.31,
            "price": 1.247
          }
        }
      },
      "FRY3": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.73,
            "price": 0.785
          },
          "2": {
            "occupancy": 0.957,
            "price": 0.966
          },
          "3": {
            "occupancy": 0.987,
            "price": 0.99
          },
          "4": {
            "occupancy": 0.891,
            "price": 0.913
          },
          "5": {
            "occupancy": 0.789,
            "price": 0.832
          },
          "6": {
            "occupancy": 0.749,
            "price": 0.8
          },
          "7": {
            "occupancy": 1.197,
            "price": 1.157
          },
          "8": {
            "occupancy": 1.489,
            "price": 1.39
          },
          "9": {
            "occupancy": 0.924,
            "price": 0.939
          },
          "10": {
            "occupancy": 1.254,
            "price": 1.202
          },
          "11": {
            "occupancy": 1.018,
            "price": 1.014
          },
          "12": {
            "occupancy": 1.014,
            "price": 1.011
          }
        }
      },
      "FRK2": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 1.138,
            "price": 1.11
          },
          "2": {
            "occupancy": 1.679,
            "price": 1.541
          },
          "3": {
            "occupancy": 1.097,
            "price": 1.077
          },
          "4": {
            "occupancy": 0.72,
            "price": 0.777
          },
          "5": {
            "occupancy": 0.643,
            "price": 0.715
          },
          "6": {
            "occupancy": 0.761,
            "price": 0.81
          },
          "7": {
            "occupancy": 1.422,
            "price": 1.336
          },
          "8": {
            "occupancy": 1.761,
            "price": 1.607
          },
          "9": {
            "occupancy": 0.603,
            "price": 0.684
          },
          "10": {
            "occupancy": 0.534,
            "price": 0.629
          },
          "11": {
            "occupancy": 0.395,
            "price": 0.518
          },
          "12": {
            "occupancy": 1.247,
            "price": 1.197
          }
        }
      },
      "FRK1": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.547,
            "price": 0.639
          },
          "2": {
            "occupancy": 1.09,
            "price": 1.072
          },
          "3": {
            "occupancy": 0.52,
            "price": 0.617
          },
          "4": {
            "occupancy": 0.848,
            "price": 0.879
          },
          "5": {
            "occupancy": 1.046,
            "price": 1.037
          },
          "6": {
            "occupancy": 0.839,
            "price": 0.872
          },
          "7": {
            "occupancy": 1.758,
            "price": 1.604
          },
          "8": {
            "occupancy": 2.45,
            "price": 2.156
          },
          "9": {
            "occupancy": 0.711,
            "price": 0.77
          },
          "10": {
            "occupancy": 0.768,
            "price": 0.815
          },
          "11": {
            "occupancy": 0.452,
            "price": 0.563
          },
          "12": {
            "occupancy": 0.972,
            "price": 0.978
          }
        }
      },
      "FRC1": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.464,
            "price": 0.573
          },
          "2": {
            "occupancy": 0.522,
            "price": 0.619
          },
          "3": {
            "occupancy": 0.537,
            "price": 0.631
          },
          "4": {
            "occupancy": 0.982,
            "price": 0.986
          },
          "5": {
            "occupancy": 1.245,
            "price": 1.195
          },
          "6": {
            "occupancy": 1.108,
            "price": 1.086
          },
          "7": {
            "occupancy": 1.727,
            "price": 1.579
          },
          "8": {
            "occupancy": 1.956,
            "price": 1.762
          },
          "9": {
            "occupancy": 0.993,
            "price": 0.994
          },
          "10": {
            "occupancy": 0.954,
            "price": 0.963
          },
          "11": {
            "occupancy": 0.656,
            "price": 0.726
          },
          "12": {
            "occupancy": 0.856,
            "price": 0.885
          }
        }
      },
      "FRH0": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.279,
            "price": 0.425
          },
          "2": {
            "occupancy": 0.367,
            "price": 0.495
          },
          "3": {
            "occupancy": 0.37,
            "price": 0.498
          },
          "4": {
            "occupancy": 0.95,
            "price": 0.96
          },
          "5": {
            "occupancy": 1.087,
            "price": 1.069
          },
          "6": {
            "occupancy": 1.06,
            "price": 1.048
          },
          "7": {
            "occupancy": 2.28,
            "price": 2.02
          },
          "8": {
            "occupancy": 3.018,
            "price": 2.608
          },
          "9": {
            "occupancy": 0.908,
            "price": 0.927
          },
          "10": {
            "occupancy": 0.712,
            "price": 0.77
          },
          "11": {
            "occupancy": 0.36,
            "price": 0.49
          },
          "12": {
            "occupancy": 0.61,
            "price": 0.689
          }
        }
      },
      "FRJ1": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.342,
            "price": 0.476
          },
          "2": {
            "occupancy": 0.453,
            "price": 0.564
          },
          "3": {
            "occupancy": 0.374,
            "price": 0.501
          },
          "4": {
            "occupancy": 0.763,
            "price": 0.811
          },
          "5": {
            "occupancy": 0.878,
            "price": 0.903
          },
          "6": {
            "occupancy": 0.984,
            "price": 0.987
          },
          "7": {
            "occupancy": 2.404,
            "price": 2.119
          },
          "8": {
            "occupancy": 3.322,
            "price": 2.851
          },
          "9": {
            "occupancy": 0.82,
            "price": 0.857
          },
          "10": {
            "occupancy": 0.647,
            "price": 0.719
          },
          "11": {
            "occupancy": 0.343,
            "price": 0.476
          },
          "12": {
            "occupancy": 0.672,
            "price": 0.739
          }
        }
      },
      "FRL0": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.359,
            "price": 0.489
          },
          "2": {
            "occupancy": 0.549,
            "price": 0.641
          },
          "3": {
            "occupancy": 0.451,
            "price": 0.562
          },
          "4": {
            "occupancy": 0.806,
            "price": 0.845
          },
          "5": {
            "occupancy": 0.998,
            "price": 0.998
          },
          "6": {
            "occupancy": 1.275,
            "price": 1.219
          },
          "7": {
            "occupancy": 2.296,
            "price": 2.033
          },
          "8": {
            "occupancy": 2.718,
            "price": 2.369
          },
          "9": {
            "occupancy": 1.027,
            "price": 1.022
          },
          "10": {
            "occupancy": 0.692,
            "price": 0.755
          },
          "11": {
            "occupancy": 0.293,
            "price": 0.437
          },
          "12": {
            "occupancy": 0.537,
            "price": 0.631
          }
        }
      },
      "FRE2": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.444,
            "price": 0.557
          },
          "2": {
            "occupancy": 0.532,
            "price": 0.627
          },
          "3": {
            "occupancy": 0.536,
            "price": 0.63
          },
          "4": {
            "occupancy": 1.188,
            "price": 1.15
          },
          "5": {
            "occupancy": 1.249,
            "price": 1.198
          },
          "6": {
            "occupancy": 1.11,
            "price": 1.088
          },
          "7": {
            "occupancy": 1.645,
            "price": 1.514
          },
          "8": {
            "occupancy": 1.934,
            "price": 1.744
          },
          "9": {
            "occupancy": 0.914,
            "price": 0.931
          },
          "10": {
            "occupancy": 0.944,
            "price": 0.955
          },
          "11": {
            "occupancy": 0.596,
            "price": 0.678
          },
          "12": {
            "occupancy": 0.906,
            "price": 0.925
          }
        }
      },
      "FRG0": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.347,
            "price": 0.48
          },
          "2": {
            "occupancy": 0.41,
            "price": 0.53
          },
          "3": {
            "occupancy": 0.429,
            "price": 0.545
          },
          "4": {
            "occupancy": 0.933,
            "price": 0.947
          },
          "5": {
            "occupancy": 1.157,
            "price": 1.125
          },
          "6": {
            "occupancy": 1.127,
            "price": 1.101
          },
          "7": {
            "occupancy": 2.101,
            "price": 1.877
          },
          "8": {
            "occupancy": 2.766,
            "price": 2.408
          },
          "9": {
            "occupancy": 0.831,
            "price": 0.865
          },
          "10": {
            "occupancy": 0.791,
            "price": 0.833
          },
          "11": {
            "occupancy": 0.466,
            "price": 0.574
          },
          "12": {
            "occupancy": 0.642,
            "price": 0.715
          }
        }
      },
      "FRY1": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 1.61,
            "price": 1.486
          },
          "2": {
            "occupancy": 1.734,
            "price": 1.585
          },
          "3": {
            "occupancy": 1.486,
            "price": 1.387
          },
          "4": {
            "occupancy": 1.371,
            "price": 1.296
          },
          "5": {
            "occupancy": 0.626,
            "price": 0.702
          },
          "6": {
            "occupancy": 0.514,
            "price": 0.613
          },
          "7": {
            "occupancy": 1.023,
            "price": 1.018
          },
          "8": {
            "occupancy": 0.922,
            "price": 0.938
          },
          "9": {
            "occupancy": 0.266,
            "price": 0.415
          },
          "10": {
            "occupancy": 0.461,
            "price": 0.57
          },
          "11": {
            "occupancy": 0.708,
            "price": 0.767
          },
          "12": {
            "occupancy": 1.279,
            "price": 1.222
          }
        }
      },
      "FRY5": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.62,
            "price": 0.697
          },
          "2": {
            "occupancy": 0.7,
            "price": 0.761
          },
          "3": {
            "occupancy": 0.669,
            "price": 0.736
          },
          "4": {
            "occupancy": 0.927,
            "price": 0.942
          },
          "5": {
            "occupancy": 1.065,
            "price": 1.052
          },
          "6": {
            "occupancy": 0.919,
            "price": 0.935
          },
          "7": {
            "occupancy": 1.044,
            "price": 1.035
          },
          "8": {
            "occupancy": 1.214,
            "price": 1.171
          },
          "9": {
            "occupancy": 1.046,
            "price": 1.037
          },
          "10": {
            "occupancy": 1.255,
            "price": 1.203
          },
          "11": {
            "occupancy": 1.353,
            "price": 1.281
          },
          "12": {
            "occupancy": 1.187,
            "price": 1.149
          }
        }
      },
      "FRI1": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.27,
            "price": 0.418
          },
          "2": {
            "occupancy": 0.339,
            "price": 0.473
          },
          "3": {
            "occupancy": 0.351,
            "price": 0.483
          },
          "4": {
            "occupancy": 0.786,
            "price": 0.829
          },
          "5": {
            "occupancy": 0.95,
            "price": 0.96
          },
          "6": {
            "occupancy": 1.008,
            "price": 1.006
          },
          "7": {
            "occupancy": 2.502,
            "price": 2.197
          },
          "8": {
            "occupancy": 3.401,
            "price": 2.914
          },
          "9": {
            "occupancy": 0.877,
            "price": 0.902
          },
          "10": {
            "occupancy": 0.633,
            "price": 0.708
          },
          "11": {
            "occupancy": 0.338,
            "price": 0.472
          },
          "12": {
            "occupancy": 0.546,
            "price": 0.638
          }
        }
      },
      "FRE1": {
        "year": "2025",
        "months": {
          "1": {
            "occupancy": 0.48,
            "price": 0.586
          },
          "2": {
            "occupancy": 0.61,
            "price": 0.689
          },
          "3": {
            "occupancy": 0.625,
            "price": 0.701
          },
          "4": {
            "occupancy": 1.131,
            "price": 1.104
          },
          "5": {
            "occupancy": 1.171,
            "price": 1.136
          },
          "6": {
            "occupancy": 1.014,
            "price": 1.011
          },
          "7": {
            "occupancy": 1.679,
            "price": 1.541
          },
          "8": {
            "occupancy": 1.884,
            "price": 1.705
          },
          "9": {
            "occupancy": 0.894,
            "price": 0.916
          },
          "10": {
            "occupancy": 0.949,
            "price": 0.959
          },
          "11": {
            "occupancy": 0.646,
            "price": 0.718
          },
          "12": {
            "occupancy": 0.916,
            "price": 0.933
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
    "anchors": {
      "marseille": {
        "name": "Marseille",
        "price": 96.4,
        "m2": 2899,
        "occupancy": 1.0,
        "occupancyTop": 1.0,
        "listings": 8767,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 69.4,
        "seasonality": {
          "1": {
            "occupancy": 0.716,
            "price": 0.908
          },
          "2": {
            "occupancy": 0.824,
            "price": 0.906
          },
          "3": {
            "occupancy": 0.876,
            "price": 1.016
          },
          "4": {
            "occupancy": 1.106,
            "price": 1.065
          },
          "5": {
            "occupancy": 1.069,
            "price": 1.104
          },
          "6": {
            "occupancy": 0.949,
            "price": 1.128
          },
          "7": {
            "occupancy": 1.156,
            "price": 1.168
          },
          "8": {
            "occupancy": 1.363,
            "price": 0.999
          },
          "9": {
            "occupancy": 1.141,
            "price": 0.947
          },
          "10": {
            "occupancy": 1.099,
            "price": 0.939
          },
          "11": {
            "occupancy": 0.905,
            "price": 0.911
          },
          "12": {
            "occupancy": 0.795,
            "price": 0.91
          }
        }
      },
      "toulouse": {
        "name": "Toulouse",
        "price": 64.8,
        "m2": 3293,
        "occupancy": 1.022,
        "occupancyTop": 1.0,
        "listings": 3878,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 75.7,
        "seasonality": {
          "1": {
            "occupancy": 0.864,
            "price": 0.934
          },
          "2": {
            "occupancy": 0.964,
            "price": 0.925
          },
          "3": {
            "occupancy": 0.979,
            "price": 1.029
          },
          "4": {
            "occupancy": 1.03,
            "price": 1.065
          },
          "5": {
            "occupancy": 0.948,
            "price": 1.076
          },
          "6": {
            "occupancy": 0.882,
            "price": 1.084
          },
          "7": {
            "occupancy": 0.97,
            "price": 1.1
          },
          "8": {
            "occupancy": 1.059,
            "price": 0.955
          },
          "9": {
            "occupancy": 1.085,
            "price": 0.967
          },
          "10": {
            "occupancy": 1.151,
            "price": 0.971
          },
          "11": {
            "occupancy": 1.033,
            "price": 0.944
          },
          "12": {
            "occupancy": 1.034,
            "price": 0.95
          }
        }
      },
      "nice": {
        "name": "Nice",
        "price": 126.2,
        "m2": 4556,
        "occupancy": 1.022,
        "occupancyTop": 1.015,
        "listings": 9856,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 94.3,
        "seasonality": {
          "1": {
            "occupancy": 0.636,
            "price": 0.88
          },
          "2": {
            "occupancy": 0.822,
            "price": 0.896
          },
          "3": {
            "occupancy": 0.856,
            "price": 0.939
          },
          "4": {
            "occupancy": 1.042,
            "price": 1.007
          },
          "5": {
            "occupancy": 1.143,
            "price": 1.082
          },
          "6": {
            "occupancy": 1.068,
            "price": 1.166
          },
          "7": {
            "occupancy": 1.234,
            "price": 1.219
          },
          "8": {
            "occupancy": 1.399,
            "price": 1.085
          },
          "9": {
            "occupancy": 1.285,
            "price": 1.015
          },
          "10": {
            "occupancy": 1.058,
            "price": 0.936
          },
          "11": {
            "occupancy": 0.75,
            "price": 0.881
          },
          "12": {
            "occupancy": 0.706,
            "price": 0.894
          }
        }
      },
      "nantes": {
        "name": "Nantes",
        "price": 68.2,
        "m2": 3667,
        "occupancy": 0.933,
        "occupancyTop": 0.941,
        "listings": 2103,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 81.4,
        "seasonality": {
          "1": {
            "occupancy": 0.885,
            "price": 0.947
          },
          "2": {
            "occupancy": 0.924,
            "price": 0.947
          },
          "3": {
            "occupancy": 0.963,
            "price": 1.055
          },
          "4": {
            "occupancy": 0.974,
            "price": 1.065
          },
          "5": {
            "occupancy": 0.921,
            "price": 1.074
          },
          "6": {
            "occupancy": 0.97,
            "price": 1.091
          },
          "7": {
            "occupancy": 1.015,
            "price": 1.066
          },
          "8": {
            "occupancy": 1.06,
            "price": 0.955
          },
          "9": {
            "occupancy": 1.111,
            "price": 0.954
          },
          "10": {
            "occupancy": 1.078,
            "price": 0.959
          },
          "11": {
            "occupancy": 1.047,
            "price": 0.944
          },
          "12": {
            "occupancy": 1.052,
            "price": 0.944
          }
        }
      },
      "montpellier": {
        "name": "Montpellier",
        "price": 72.5,
        "m2": 3333,
        "occupancy": 1.0,
        "occupancyTop": 0.985,
        "listings": 3241,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 76.3,
        "seasonality": {
          "1": {
            "occupancy": 0.815,
            "price": 0.928
          },
          "2": {
            "occupancy": 0.887,
            "price": 0.924
          },
          "3": {
            "occupancy": 0.898,
            "price": 1.024
          },
          "4": {
            "occupancy": 1.013,
            "price": 1.048
          },
          "5": {
            "occupancy": 0.974,
            "price": 1.078
          },
          "6": {
            "occupancy": 0.894,
            "price": 1.09
          },
          "7": {
            "occupancy": 1.074,
            "price": 1.133
          },
          "8": {
            "occupancy": 1.253,
            "price": 0.999
          },
          "9": {
            "occupancy": 1.133,
            "price": 0.96
          },
          "10": {
            "occupancy": 1.088,
            "price": 0.952
          },
          "11": {
            "occupancy": 1.037,
            "price": 0.932
          },
          "12": {
            "occupancy": 0.933,
            "price": 0.932
          }
        }
      },
      "strasbourg": {
        "name": "Strasbourg",
        "price": 104.1,
        "m2": 0,
        "occupancy": 1.044,
        "occupancyTop": 1.015,
        "listings": 2655,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": null,
        "seasonality": {
          "1": {
            "occupancy": 0.77,
            "price": 0.95
          },
          "2": {
            "occupancy": 0.815,
            "price": 0.907
          },
          "3": {
            "occupancy": 0.88,
            "price": 0.947
          },
          "4": {
            "occupancy": 1.024,
            "price": 0.97
          },
          "5": {
            "occupancy": 1.012,
            "price": 1.019
          },
          "6": {
            "occupancy": 0.83,
            "price": 1.018
          },
          "7": {
            "occupancy": 0.959,
            "price": 1.023
          },
          "8": {
            "occupancy": 1.088,
            "price": 0.906
          },
          "9": {
            "occupancy": 1.089,
            "price": 0.925
          },
          "10": {
            "occupancy": 1.137,
            "price": 0.941
          },
          "11": {
            "occupancy": 1.015,
            "price": 1.04
          },
          "12": {
            "occupancy": 1.38,
            "price": 1.353
          }
        }
      },
      "lille": {
        "name": "Lille",
        "price": 87.0,
        "m2": 3763,
        "occupancy": 0.978,
        "occupancyTop": 0.971,
        "listings": 1846,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 82.9,
        "seasonality": {
          "1": {
            "occupancy": 0.888,
            "price": 0.926
          },
          "2": {
            "occupancy": 0.961,
            "price": 0.915
          },
          "3": {
            "occupancy": 1.018,
            "price": 1.083
          },
          "4": {
            "occupancy": 1.008,
            "price": 1.065
          },
          "5": {
            "occupancy": 0.949,
            "price": 1.058
          },
          "6": {
            "occupancy": 0.94,
            "price": 1.078
          },
          "7": {
            "occupancy": 0.96,
            "price": 1.059
          },
          "8": {
            "occupancy": 0.98,
            "price": 0.933
          },
          "9": {
            "occupancy": 1.059,
            "price": 0.993
          },
          "10": {
            "occupancy": 1.079,
            "price": 0.961
          },
          "11": {
            "occupancy": 1.061,
            "price": 0.954
          },
          "12": {
            "occupancy": 1.096,
            "price": 0.974
          }
        }
      },
      "rennes": {
        "name": "Rennes",
        "price": 66.5,
        "m2": 3700,
        "occupancy": 1.067,
        "occupancyTop": 1.0,
        "listings": 1360,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 81.9,
        "seasonality": {
          "1": {
            "occupancy": 0.936,
            "price": 0.938
          },
          "2": {
            "occupancy": 0.964,
            "price": 0.932
          },
          "3": {
            "occupancy": 1.005,
            "price": 1.041
          },
          "4": {
            "occupancy": 0.945,
            "price": 1.049
          },
          "5": {
            "occupancy": 0.858,
            "price": 1.056
          },
          "6": {
            "occupancy": 0.904,
            "price": 1.069
          },
          "7": {
            "occupancy": 0.949,
            "price": 1.049
          },
          "8": {
            "occupancy": 0.994,
            "price": 0.95
          },
          "9": {
            "occupancy": 1.135,
            "price": 1.001
          },
          "10": {
            "occupancy": 1.206,
            "price": 0.989
          },
          "11": {
            "occupancy": 1.097,
            "price": 0.962
          },
          "12": {
            "occupancy": 1.007,
            "price": 0.964
          }
        }
      },
      "reims": {
        "name": "Reims",
        "price": 75.1,
        "m2": 2731,
        "occupancy": 0.822,
        "occupancyTop": 0.824,
        "listings": 1715,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 66.7,
        "seasonality": {
          "1": {
            "occupancy": 0.725,
            "price": 0.909
          },
          "2": {
            "occupancy": 0.813,
            "price": 0.9
          },
          "3": {
            "occupancy": 0.852,
            "price": 0.993
          },
          "4": {
            "occupancy": 1.086,
            "price": 1.082
          },
          "5": {
            "occupancy": 1.036,
            "price": 1.107
          },
          "6": {
            "occupancy": 0.911,
            "price": 1.092
          },
          "7": {
            "occupancy": 1.027,
            "price": 1.118
          },
          "8": {
            "occupancy": 1.143,
            "price": 0.961
          },
          "9": {
            "occupancy": 1.211,
            "price": 0.977
          },
          "10": {
            "occupancy": 1.099,
            "price": 0.97
          },
          "11": {
            "occupancy": 0.97,
            "price": 0.932
          },
          "12": {
            "occupancy": 1.127,
            "price": 0.958
          }
        }
      },
      "toulon": {
        "name": "Toulon",
        "price": 78.4,
        "m2": 2572,
        "occupancy": 0.756,
        "occupancyTop": 0.824,
        "listings": 1833,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 64.0,
        "seasonality": {
          "1": {
            "occupancy": 0.799,
            "price": 0.921
          },
          "2": {
            "occupancy": 0.866,
            "price": 0.921
          },
          "3": {
            "occupancy": 0.809,
            "price": 0.998
          },
          "4": {
            "occupancy": 0.928,
            "price": 1.032
          },
          "5": {
            "occupancy": 0.887,
            "price": 1.063
          },
          "6": {
            "occupancy": 0.828,
            "price": 1.089
          },
          "7": {
            "occupancy": 1.232,
            "price": 1.187
          },
          "8": {
            "occupancy": 1.636,
            "price": 1.059
          },
          "9": {
            "occupancy": 1.14,
            "price": 0.962
          },
          "10": {
            "occupancy": 1.04,
            "price": 0.941
          },
          "11": {
            "occupancy": 0.93,
            "price": 0.913
          },
          "12": {
            "occupancy": 0.905,
            "price": 0.916
          }
        }
      },
      "grenoble": {
        "name": "Grenoble",
        "price": 58.0,
        "m2": 2607,
        "occupancy": 0.911,
        "occupancyTop": 0.926,
        "listings": 1338,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 64.6,
        "seasonality": {
          "1": {
            "occupancy": 0.947,
            "price": 0.966
          },
          "2": {
            "occupancy": 1.072,
            "price": 0.964
          },
          "3": {
            "occupancy": 1.043,
            "price": 1.041
          },
          "4": {
            "occupancy": 0.956,
            "price": 1.035
          },
          "5": {
            "occupancy": 0.849,
            "price": 1.043
          },
          "6": {
            "occupancy": 0.854,
            "price": 1.055
          },
          "7": {
            "occupancy": 0.922,
            "price": 1.079
          },
          "8": {
            "occupancy": 0.991,
            "price": 0.945
          },
          "9": {
            "occupancy": 1.133,
            "price": 0.961
          },
          "10": {
            "occupancy": 1.105,
            "price": 0.969
          },
          "11": {
            "occupancy": 1.066,
            "price": 0.959
          },
          "12": {
            "occupancy": 1.062,
            "price": 0.982
          }
        }
      },
      "dijon": {
        "name": "Dijon",
        "price": 66.5,
        "m2": 2685,
        "occupancy": 0.889,
        "occupancyTop": 0.897,
        "listings": 1698,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 65.9,
        "seasonality": {
          "1": {
            "occupancy": 0.786,
            "price": 0.919
          },
          "2": {
            "occupancy": 0.871,
            "price": 0.911
          },
          "3": {
            "occupancy": 0.89,
            "price": 1.004
          },
          "4": {
            "occupancy": 1.029,
            "price": 1.068
          },
          "5": {
            "occupancy": 0.992,
            "price": 1.088
          },
          "6": {
            "occupancy": 0.934,
            "price": 1.093
          },
          "7": {
            "occupancy": 1.032,
            "price": 1.125
          },
          "8": {
            "occupancy": 1.13,
            "price": 0.975
          },
          "9": {
            "occupancy": 1.121,
            "price": 0.965
          },
          "10": {
            "occupancy": 1.18,
            "price": 0.97
          },
          "11": {
            "occupancy": 1.042,
            "price": 0.941
          },
          "12": {
            "occupancy": 0.992,
            "price": 0.941
          }
        }
      },
      "angers": {
        "name": "Angers",
        "price": 63.9,
        "m2": 3140,
        "occupancy": 1.089,
        "occupancyTop": 1.0,
        "listings": 1157,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 73.3,
        "seasonality": {
          "1": {
            "occupancy": 0.992,
            "price": 0.945
          },
          "2": {
            "occupancy": 0.907,
            "price": 0.925
          },
          "3": {
            "occupancy": 0.935,
            "price": 1.031
          },
          "4": {
            "occupancy": 0.878,
            "price": 1.062
          },
          "5": {
            "occupancy": 0.888,
            "price": 1.081
          },
          "6": {
            "occupancy": 0.967,
            "price": 1.09
          },
          "7": {
            "occupancy": 0.982,
            "price": 1.075
          },
          "8": {
            "occupancy": 0.998,
            "price": 0.959
          },
          "9": {
            "occupancy": 1.11,
            "price": 0.958
          },
          "10": {
            "occupancy": 1.16,
            "price": 0.969
          },
          "11": {
            "occupancy": 1.076,
            "price": 0.95
          },
          "12": {
            "occupancy": 1.104,
            "price": 0.955
          }
        }
      },
      "nimes": {
        "name": "Nîmes",
        "price": 79.3,
        "m2": 2083,
        "occupancy": 0.711,
        "occupancyTop": 0.794,
        "listings": 1143,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 55.5,
        "seasonality": {
          "1": {
            "occupancy": 0.826,
            "price": 0.907
          },
          "2": {
            "occupancy": 0.859,
            "price": 0.906
          },
          "3": {
            "occupancy": 0.86,
            "price": 1.025
          },
          "4": {
            "occupancy": 1.008,
            "price": 1.066
          },
          "5": {
            "occupancy": 0.985,
            "price": 1.153
          },
          "6": {
            "occupancy": 0.941,
            "price": 1.136
          },
          "7": {
            "occupancy": 1.185,
            "price": 1.174
          },
          "8": {
            "occupancy": 1.429,
            "price": 0.965
          },
          "9": {
            "occupancy": 1.121,
            "price": 0.948
          },
          "10": {
            "occupancy": 1.016,
            "price": 0.919
          },
          "11": {
            "occupancy": 0.915,
            "price": 0.9
          },
          "12": {
            "occupancy": 0.855,
            "price": 0.901
          }
        }
      },
      "aix-en-provence": {
        "name": "Aix-en-Provence",
        "price": 98.9,
        "m2": 4751,
        "occupancy": 0.956,
        "occupancyTop": 0.985,
        "listings": 2342,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 97.1,
        "seasonality": {
          "1": {
            "occupancy": 0.737,
            "price": 0.922
          },
          "2": {
            "occupancy": 0.832,
            "price": 0.922
          },
          "3": {
            "occupancy": 0.896,
            "price": 1.035
          },
          "4": {
            "occupancy": 1.03,
            "price": 1.06
          },
          "5": {
            "occupancy": 1.088,
            "price": 1.088
          },
          "6": {
            "occupancy": 1.022,
            "price": 1.109
          },
          "7": {
            "occupancy": 1.106,
            "price": 1.131
          },
          "8": {
            "occupancy": 1.19,
            "price": 0.98
          },
          "9": {
            "occupancy": 1.27,
            "price": 0.959
          },
          "10": {
            "occupancy": 1.138,
            "price": 0.943
          },
          "11": {
            "occupancy": 0.863,
            "price": 0.924
          },
          "12": {
            "occupancy": 0.829,
            "price": 0.925
          }
        }
      },
      "saint-etienne": {
        "name": "Saint-Étienne",
        "price": 51.1,
        "m2": 1210,
        "occupancy": 0.778,
        "occupancyTop": 0.853,
        "listings": 860,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 38.4,
        "seasonality": {
          "1": {
            "occupancy": 0.984,
            "price": 0.943
          },
          "2": {
            "occupancy": 0.988,
            "price": 0.938
          },
          "3": {
            "occupancy": 1.014,
            "price": 1.025
          },
          "4": {
            "occupancy": 0.959,
            "price": 1.064
          },
          "5": {
            "occupancy": 0.864,
            "price": 1.082
          },
          "6": {
            "occupancy": 0.856,
            "price": 1.084
          },
          "7": {
            "occupancy": 0.92,
            "price": 1.091
          },
          "8": {
            "occupancy": 0.984,
            "price": 0.948
          },
          "9": {
            "occupancy": 1.116,
            "price": 0.954
          },
          "10": {
            "occupancy": 1.121,
            "price": 0.964
          },
          "11": {
            "occupancy": 1.1,
            "price": 0.954
          },
          "12": {
            "occupancy": 1.096,
            "price": 0.953
          }
        }
      },
      "clermont-ferrand": {
        "name": "Clermont-Ferrand",
        "price": 61.4,
        "m2": 2130,
        "occupancy": 0.8,
        "occupancyTop": 0.853,
        "listings": 1076,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 56.4,
        "seasonality": {
          "1": {
            "occupancy": 0.83,
            "price": 0.914
          },
          "2": {
            "occupancy": 0.981,
            "price": 0.917
          },
          "3": {
            "occupancy": 0.837,
            "price": 1.008
          },
          "4": {
            "occupancy": 0.917,
            "price": 1.054
          },
          "5": {
            "occupancy": 0.913,
            "price": 1.117
          },
          "6": {
            "occupancy": 0.856,
            "price": 1.082
          },
          "7": {
            "occupancy": 1.077,
            "price": 1.149
          },
          "8": {
            "occupancy": 1.298,
            "price": 0.987
          },
          "9": {
            "occupancy": 1.097,
            "price": 0.949
          },
          "10": {
            "occupancy": 1.152,
            "price": 0.979
          },
          "11": {
            "occupancy": 1.027,
            "price": 0.923
          },
          "12": {
            "occupancy": 1.018,
            "price": 0.92
          }
        }
      },
      "le-havre": {
        "name": "Le Havre",
        "price": 63.9,
        "m2": 2308,
        "occupancy": 0.822,
        "occupancyTop": 0.868,
        "listings": 1110,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 59.5,
        "seasonality": {
          "1": {
            "occupancy": 0.726,
            "price": 0.903
          },
          "2": {
            "occupancy": 0.863,
            "price": 0.894
          },
          "3": {
            "occupancy": 0.945,
            "price": 0.992
          },
          "4": {
            "occupancy": 0.914,
            "price": 1.056
          },
          "5": {
            "occupancy": 0.917,
            "price": 1.106
          },
          "6": {
            "occupancy": 0.853,
            "price": 1.078
          },
          "7": {
            "occupancy": 1.174,
            "price": 1.189
          },
          "8": {
            "occupancy": 1.494,
            "price": 0.996
          },
          "9": {
            "occupancy": 1.147,
            "price": 0.934
          },
          "10": {
            "occupancy": 1.174,
            "price": 1.008
          },
          "11": {
            "occupancy": 0.922,
            "price": 0.922
          },
          "12": {
            "occupancy": 0.87,
            "price": 0.922
          }
        }
      },
      "brest": {
        "name": "Brest",
        "price": 57.2,
        "m2": 2039,
        "occupancy": 0.978,
        "occupancyTop": 0.941,
        "listings": 960,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 54.7,
        "seasonality": {
          "1": {
            "occupancy": 0.865,
            "price": 0.926
          },
          "2": {
            "occupancy": 0.956,
            "price": 0.921
          },
          "3": {
            "occupancy": 0.922,
            "price": 1.068
          },
          "4": {
            "occupancy": 0.912,
            "price": 1.073
          },
          "5": {
            "occupancy": 0.83,
            "price": 1.088
          },
          "6": {
            "occupancy": 0.857,
            "price": 1.087
          },
          "7": {
            "occupancy": 1.102,
            "price": 1.149
          },
          "8": {
            "occupancy": 1.347,
            "price": 0.969
          },
          "9": {
            "occupancy": 1.064,
            "price": 0.928
          },
          "10": {
            "occupancy": 1.134,
            "price": 0.935
          },
          "11": {
            "occupancy": 1.042,
            "price": 0.925
          },
          "12": {
            "occupancy": 0.968,
            "price": 0.93
          }
        }
      },
      "tours": {
        "name": "Tours",
        "price": 64.8,
        "m2": 2862,
        "occupancy": 0.867,
        "occupancyTop": 0.897,
        "listings": 1242,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 68.8,
        "seasonality": {
          "1": {
            "occupancy": 0.796,
            "price": 0.911
          },
          "2": {
            "occupancy": 0.875,
            "price": 0.906
          },
          "3": {
            "occupancy": 0.907,
            "price": 1.007
          },
          "4": {
            "occupancy": 1.006,
            "price": 1.076
          },
          "5": {
            "occupancy": 1.032,
            "price": 1.108
          },
          "6": {
            "occupancy": 0.955,
            "price": 1.126
          },
          "7": {
            "occupancy": 1.073,
            "price": 1.134
          },
          "8": {
            "occupancy": 1.191,
            "price": 0.978
          },
          "9": {
            "occupancy": 1.149,
            "price": 0.946
          },
          "10": {
            "occupancy": 1.081,
            "price": 0.951
          },
          "11": {
            "occupancy": 0.94,
            "price": 0.925
          },
          "12": {
            "occupancy": 0.996,
            "price": 0.932
          }
        }
      },
      "orleans": {
        "name": "Orléans",
        "price": 58.9,
        "m2": 2561,
        "occupancy": 0.889,
        "occupancyTop": 0.897,
        "listings": 955,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 63.8,
        "seasonality": {
          "1": {
            "occupancy": 0.781,
            "price": 0.928
          },
          "2": {
            "occupancy": 0.838,
            "price": 0.92
          },
          "3": {
            "occupancy": 0.912,
            "price": 1.005
          },
          "4": {
            "occupancy": 1.004,
            "price": 1.061
          },
          "5": {
            "occupancy": 0.972,
            "price": 1.085
          },
          "6": {
            "occupancy": 1.028,
            "price": 1.089
          },
          "7": {
            "occupancy": 1.103,
            "price": 1.107
          },
          "8": {
            "occupancy": 1.178,
            "price": 0.984
          },
          "9": {
            "occupancy": 1.099,
            "price": 0.966
          },
          "10": {
            "occupancy": 1.058,
            "price": 0.963
          },
          "11": {
            "occupancy": 1.009,
            "price": 0.946
          },
          "12": {
            "occupancy": 1.018,
            "price": 0.945
          }
        }
      },
      "rouen": {
        "name": "Rouen",
        "price": 63.9,
        "m2": 2818,
        "occupancy": 0.867,
        "occupancyTop": 0.897,
        "listings": 1430,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 68.1,
        "seasonality": {
          "1": {
            "occupancy": 0.833,
            "price": 0.941
          },
          "2": {
            "occupancy": 0.87,
            "price": 0.938
          },
          "3": {
            "occupancy": 0.886,
            "price": 1.018
          },
          "4": {
            "occupancy": 1.032,
            "price": 1.047
          },
          "5": {
            "occupancy": 0.937,
            "price": 1.071
          },
          "6": {
            "occupancy": 0.879,
            "price": 1.058
          },
          "7": {
            "occupancy": 1.041,
            "price": 1.095
          },
          "8": {
            "occupancy": 1.203,
            "price": 0.982
          },
          "9": {
            "occupancy": 1.121,
            "price": 0.968
          },
          "10": {
            "occupancy": 1.138,
            "price": 0.972
          },
          "11": {
            "occupancy": 1.008,
            "price": 0.954
          },
          "12": {
            "occupancy": 1.05,
            "price": 0.957
          }
        }
      },
      "caen": {
        "name": "Caen",
        "price": 69.9,
        "m2": 2812,
        "occupancy": 0.933,
        "occupancyTop": 0.941,
        "listings": 1009,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 68.0,
        "seasonality": {
          "1": {
            "occupancy": 0.812,
            "price": 0.924
          },
          "2": {
            "occupancy": 0.933,
            "price": 0.926
          },
          "3": {
            "occupancy": 0.902,
            "price": 0.974
          },
          "4": {
            "occupancy": 0.941,
            "price": 1.033
          },
          "5": {
            "occupancy": 0.928,
            "price": 1.079
          },
          "6": {
            "occupancy": 0.822,
            "price": 1.083
          },
          "7": {
            "occupancy": 1.069,
            "price": 1.119
          },
          "8": {
            "occupancy": 1.316,
            "price": 1.015
          },
          "9": {
            "occupancy": 1.177,
            "price": 0.986
          },
          "10": {
            "occupancy": 1.136,
            "price": 0.975
          },
          "11": {
            "occupancy": 0.989,
            "price": 0.944
          },
          "12": {
            "occupancy": 0.974,
            "price": 0.94
          }
        }
      },
      "metz": {
        "name": "Metz",
        "price": 75.1,
        "m2": 0,
        "occupancy": 0.889,
        "occupancyTop": 0.897,
        "listings": 728,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": null,
        "seasonality": {
          "1": {
            "occupancy": 0.745,
            "price": 0.936
          },
          "2": {
            "occupancy": 0.884,
            "price": 0.922
          },
          "3": {
            "occupancy": 0.897,
            "price": 0.997
          },
          "4": {
            "occupancy": 1.016,
            "price": 1.037
          },
          "5": {
            "occupancy": 1.009,
            "price": 1.075
          },
          "6": {
            "occupancy": 0.866,
            "price": 1.066
          },
          "7": {
            "occupancy": 0.989,
            "price": 1.083
          },
          "8": {
            "occupancy": 1.113,
            "price": 0.97
          },
          "9": {
            "occupancy": 1.063,
            "price": 0.955
          },
          "10": {
            "occupancy": 1.132,
            "price": 0.973
          },
          "11": {
            "occupancy": 1.049,
            "price": 0.962
          },
          "12": {
            "occupancy": 1.238,
            "price": 1.024
          }
        }
      },
      "nancy": {
        "name": "Nancy",
        "price": 65.6,
        "m2": 2316,
        "occupancy": 0.889,
        "occupancyTop": 0.882,
        "listings": 1012,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 59.6,
        "seasonality": {
          "1": {
            "occupancy": 0.858,
            "price": 0.942
          },
          "2": {
            "occupancy": 0.876,
            "price": 0.926
          },
          "3": {
            "occupancy": 0.916,
            "price": 1.015
          },
          "4": {
            "occupancy": 0.953,
            "price": 1.042
          },
          "5": {
            "occupancy": 0.942,
            "price": 1.066
          },
          "6": {
            "occupancy": 0.932,
            "price": 1.077
          },
          "7": {
            "occupancy": 1.009,
            "price": 1.054
          },
          "8": {
            "occupancy": 1.086,
            "price": 0.965
          },
          "9": {
            "occupancy": 1.166,
            "price": 0.974
          },
          "10": {
            "occupancy": 1.105,
            "price": 0.98
          },
          "11": {
            "occupancy": 0.992,
            "price": 0.962
          },
          "12": {
            "occupancy": 1.166,
            "price": 0.998
          }
        }
      },
      "mulhouse": {
        "name": "Mulhouse",
        "price": 68.2,
        "m2": 0,
        "occupancy": 0.756,
        "occupancyTop": 0.794,
        "listings": 930,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": null,
        "seasonality": {
          "1": {
            "occupancy": 0.694,
            "price": 0.919
          },
          "2": {
            "occupancy": 0.889,
            "price": 0.89
          },
          "3": {
            "occupancy": 0.902,
            "price": 0.971
          },
          "4": {
            "occupancy": 0.9,
            "price": 1.01
          },
          "5": {
            "occupancy": 0.926,
            "price": 1.083
          },
          "6": {
            "occupancy": 0.787,
            "price": 1.072
          },
          "7": {
            "occupancy": 1.026,
            "price": 1.165
          },
          "8": {
            "occupancy": 1.265,
            "price": 0.955
          },
          "9": {
            "occupancy": 1.063,
            "price": 0.907
          },
          "10": {
            "occupancy": 1.083,
            "price": 0.926
          },
          "11": {
            "occupancy": 0.96,
            "price": 0.971
          },
          "12": {
            "occupancy": 1.506,
            "price": 1.132
          }
        }
      },
      "colmar": {
        "name": "Colmar",
        "price": 116.9,
        "m2": 0,
        "occupancy": 0.889,
        "occupancyTop": 0.912,
        "listings": 1318,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": null,
        "seasonality": {
          "1": {
            "occupancy": 0.605,
            "price": 0.924
          },
          "2": {
            "occupancy": 0.698,
            "price": 0.858
          },
          "3": {
            "occupancy": 0.759,
            "price": 0.891
          },
          "4": {
            "occupancy": 0.94,
            "price": 0.958
          },
          "5": {
            "occupancy": 0.991,
            "price": 1.036
          },
          "6": {
            "occupancy": 0.862,
            "price": 1.011
          },
          "7": {
            "occupancy": 1.095,
            "price": 1.086
          },
          "8": {
            "occupancy": 1.327,
            "price": 0.93
          },
          "9": {
            "occupancy": 1.129,
            "price": 0.892
          },
          "10": {
            "occupancy": 1.114,
            "price": 0.899
          },
          "11": {
            "occupancy": 0.946,
            "price": 1.038
          },
          "12": {
            "occupancy": 1.535,
            "price": 1.478
          }
        }
      },
      "amiens": {
        "name": "Amiens",
        "price": 64.8,
        "m2": 2650,
        "occupancy": 0.8,
        "occupancyTop": 0.824,
        "listings": 799,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 65.3,
        "seasonality": {
          "1": {
            "occupancy": 0.84,
            "price": 0.909
          },
          "2": {
            "occupancy": 0.901,
            "price": 0.901
          },
          "3": {
            "occupancy": 0.964,
            "price": 0.994
          },
          "4": {
            "occupancy": 1.0,
            "price": 1.077
          },
          "5": {
            "occupancy": 0.954,
            "price": 1.096
          },
          "6": {
            "occupancy": 0.915,
            "price": 1.085
          },
          "7": {
            "occupancy": 1.046,
            "price": 1.123
          },
          "8": {
            "occupancy": 1.177,
            "price": 0.977
          },
          "9": {
            "occupancy": 1.014,
            "price": 0.964
          },
          "10": {
            "occupancy": 0.999,
            "price": 0.971
          },
          "11": {
            "occupancy": 0.972,
            "price": 0.94
          },
          "12": {
            "occupancy": 1.217,
            "price": 0.963
          }
        }
      },
      "limoges": {
        "name": "Limoges",
        "price": 52.9,
        "m2": 1577,
        "occupancy": 0.844,
        "occupancyTop": 0.868,
        "listings": 659,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 46.0,
        "seasonality": {
          "1": {
            "occupancy": 0.859,
            "price": 0.937
          },
          "2": {
            "occupancy": 1.012,
            "price": 0.933
          },
          "3": {
            "occupancy": 1.03,
            "price": 1.033
          },
          "4": {
            "occupancy": 0.985,
            "price": 1.077
          },
          "5": {
            "occupancy": 0.924,
            "price": 1.086
          },
          "6": {
            "occupancy": 0.871,
            "price": 1.088
          },
          "7": {
            "occupancy": 0.983,
            "price": 1.117
          },
          "8": {
            "occupancy": 1.096,
            "price": 0.954
          },
          "9": {
            "occupancy": 1.089,
            "price": 0.943
          },
          "10": {
            "occupancy": 1.083,
            "price": 0.947
          },
          "11": {
            "occupancy": 1.026,
            "price": 0.942
          },
          "12": {
            "occupancy": 1.043,
            "price": 0.943
          }
        }
      },
      "perpignan": {
        "name": "Perpignan",
        "price": 66.5,
        "m2": 1489,
        "occupancy": 0.689,
        "occupancyTop": 0.765,
        "listings": 1114,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 44.2,
        "seasonality": {
          "1": {
            "occupancy": 0.763,
            "price": 0.926
          },
          "2": {
            "occupancy": 0.856,
            "price": 0.927
          },
          "3": {
            "occupancy": 0.838,
            "price": 1.029
          },
          "4": {
            "occupancy": 0.886,
            "price": 1.046
          },
          "5": {
            "occupancy": 0.837,
            "price": 1.06
          },
          "6": {
            "occupancy": 0.782,
            "price": 1.078
          },
          "7": {
            "occupancy": 1.227,
            "price": 1.169
          },
          "8": {
            "occupancy": 1.671,
            "price": 1.031
          },
          "9": {
            "occupancy": 1.101,
            "price": 0.95
          },
          "10": {
            "occupancy": 0.998,
            "price": 0.933
          },
          "11": {
            "occupancy": 0.957,
            "price": 0.92
          },
          "12": {
            "occupancy": 1.083,
            "price": 0.931
          }
        }
      },
      "besancon": {
        "name": "Besançon",
        "price": 60.6,
        "m2": 2150,
        "occupancy": 0.933,
        "occupancyTop": 0.926,
        "listings": 649,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 56.7,
        "seasonality": {
          "1": {
            "occupancy": 0.905,
            "price": 0.955
          },
          "2": {
            "occupancy": 0.897,
            "price": 0.949
          },
          "3": {
            "occupancy": 0.839,
            "price": 1.017
          },
          "4": {
            "occupancy": 0.852,
            "price": 1.035
          },
          "5": {
            "occupancy": 0.934,
            "price": 1.055
          },
          "6": {
            "occupancy": 0.926,
            "price": 1.054
          },
          "7": {
            "occupancy": 1.038,
            "price": 1.095
          },
          "8": {
            "occupancy": 1.151,
            "price": 0.971
          },
          "9": {
            "occupancy": 1.165,
            "price": 0.962
          },
          "10": {
            "occupancy": 1.156,
            "price": 0.964
          },
          "11": {
            "occupancy": 1.092,
            "price": 0.967
          },
          "12": {
            "occupancy": 1.044,
            "price": 0.977
          }
        }
      },
      "le-mans": {
        "name": "Le Mans",
        "price": 104.1,
        "m2": 1818,
        "occupancy": 0.511,
        "occupancyTop": 0.662,
        "listings": 2116,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 50.6,
        "seasonality": {
          "1": {
            "occupancy": 0.89,
            "price": 0.896
          },
          "2": {
            "occupancy": 0.932,
            "price": 0.888
          },
          "3": {
            "occupancy": 0.931,
            "price": 1.05
          },
          "4": {
            "occupancy": 0.969,
            "price": 1.123
          },
          "5": {
            "occupancy": 0.973,
            "price": 1.142
          },
          "6": {
            "occupancy": 0.925,
            "price": 1.224
          },
          "7": {
            "occupancy": 1.055,
            "price": 1.14
          },
          "8": {
            "occupancy": 1.186,
            "price": 0.902
          },
          "9": {
            "occupancy": 1.127,
            "price": 0.911
          },
          "10": {
            "occupancy": 0.954,
            "price": 0.921
          },
          "11": {
            "occupancy": 0.994,
            "price": 0.901
          },
          "12": {
            "occupancy": 1.064,
            "price": 0.903
          }
        }
      },
      "poitiers": {
        "name": "Poitiers",
        "price": 58.0,
        "m2": 2193,
        "occupancy": 0.889,
        "occupancyTop": 0.912,
        "listings": 694,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 57.5,
        "seasonality": {
          "1": {
            "occupancy": 0.746,
            "price": 0.933
          },
          "2": {
            "occupancy": 0.897,
            "price": 0.936
          },
          "3": {
            "occupancy": 1.01,
            "price": 1.042
          },
          "4": {
            "occupancy": 1.064,
            "price": 1.084
          },
          "5": {
            "occupancy": 0.956,
            "price": 1.081
          },
          "6": {
            "occupancy": 0.862,
            "price": 1.091
          },
          "7": {
            "occupancy": 1.045,
            "price": 1.113
          },
          "8": {
            "occupancy": 1.228,
            "price": 0.966
          },
          "9": {
            "occupancy": 1.056,
            "price": 0.939
          },
          "10": {
            "occupancy": 1.18,
            "price": 0.955
          },
          "11": {
            "occupancy": 0.973,
            "price": 0.93
          },
          "12": {
            "occupancy": 0.981,
            "price": 0.931
          }
        }
      },
      "pau": {
        "name": "Pau",
        "price": 57.2,
        "m2": 2048,
        "occupancy": 0.844,
        "occupancyTop": 0.868,
        "listings": 696,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 54.9,
        "seasonality": {
          "1": {
            "occupancy": 0.831,
            "price": 0.95
          },
          "2": {
            "occupancy": 0.928,
            "price": 0.935
          },
          "3": {
            "occupancy": 0.945,
            "price": 1.034
          },
          "4": {
            "occupancy": 0.978,
            "price": 1.08
          },
          "5": {
            "occupancy": 0.807,
            "price": 1.087
          },
          "6": {
            "occupancy": 0.807,
            "price": 1.094
          },
          "7": {
            "occupancy": 1.034,
            "price": 1.134
          },
          "8": {
            "occupancy": 1.261,
            "price": 0.961
          },
          "9": {
            "occupancy": 1.144,
            "price": 0.926
          },
          "10": {
            "occupancy": 1.15,
            "price": 0.943
          },
          "11": {
            "occupancy": 1.004,
            "price": 0.919
          },
          "12": {
            "occupancy": 1.109,
            "price": 0.938
          }
        }
      },
      "avignon": {
        "name": "Avignon",
        "price": 88.7,
        "m2": 2282,
        "occupancy": 0.711,
        "occupancyTop": 0.824,
        "listings": 2536,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 59.0,
        "seasonality": {
          "1": {
            "occupancy": 0.73,
            "price": 0.905
          },
          "2": {
            "occupancy": 0.907,
            "price": 0.899
          },
          "3": {
            "occupancy": 0.881,
            "price": 0.984
          },
          "4": {
            "occupancy": 1.106,
            "price": 1.033
          },
          "5": {
            "occupancy": 1.068,
            "price": 1.057
          },
          "6": {
            "occupancy": 0.952,
            "price": 1.094
          },
          "7": {
            "occupancy": 1.071,
            "price": 1.404
          },
          "8": {
            "occupancy": 1.189,
            "price": 0.967
          },
          "9": {
            "occupancy": 1.193,
            "price": 0.939
          },
          "10": {
            "occupancy": 1.153,
            "price": 0.917
          },
          "11": {
            "occupancy": 0.924,
            "price": 0.892
          },
          "12": {
            "occupancy": 0.826,
            "price": 0.909
          }
        }
      },
      "annecy": {
        "name": "Annecy",
        "price": 118.6,
        "m2": 5101,
        "occupancy": 1.022,
        "occupancyTop": 1.0,
        "listings": 3177,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 101.8,
        "seasonality": {
          "1": {
            "occupancy": 0.658,
            "price": 0.935
          },
          "2": {
            "occupancy": 0.833,
            "price": 0.91
          },
          "3": {
            "occupancy": 0.858,
            "price": 0.963
          },
          "4": {
            "occupancy": 1.006,
            "price": 1.03
          },
          "5": {
            "occupancy": 1.08,
            "price": 1.082
          },
          "6": {
            "occupancy": 0.969,
            "price": 1.262
          },
          "7": {
            "occupancy": 1.192,
            "price": 1.243
          },
          "8": {
            "occupancy": 1.416,
            "price": 1.108
          },
          "9": {
            "occupancy": 1.185,
            "price": 0.878
          },
          "10": {
            "occupancy": 1.012,
            "price": 0.843
          },
          "11": {
            "occupancy": 0.833,
            "price": 0.826
          },
          "12": {
            "occupancy": 0.957,
            "price": 0.92
          }
        }
      },
      "la-rochelle": {
        "name": "La Rochelle",
        "price": 88.7,
        "m2": 4930,
        "occupancy": 0.867,
        "occupancyTop": 0.897,
        "listings": 2861,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 99.5,
        "seasonality": {
          "1": {
            "occupancy": 0.689,
            "price": 0.923
          },
          "2": {
            "occupancy": 0.827,
            "price": 0.923
          },
          "3": {
            "occupancy": 0.83,
            "price": 1.018
          },
          "4": {
            "occupancy": 1.025,
            "price": 1.057
          },
          "5": {
            "occupancy": 1.007,
            "price": 1.081
          },
          "6": {
            "occupancy": 0.904,
            "price": 1.088
          },
          "7": {
            "occupancy": 1.209,
            "price": 1.172
          },
          "8": {
            "occupancy": 1.513,
            "price": 1.004
          },
          "9": {
            "occupancy": 1.208,
            "price": 0.951
          },
          "10": {
            "occupancy": 1.052,
            "price": 0.935
          },
          "11": {
            "occupancy": 0.871,
            "price": 0.925
          },
          "12": {
            "occupancy": 0.864,
            "price": 0.923
          }
        }
      },
      "saint-malo": {
        "name": "Saint-Malo",
        "price": 105.8,
        "m2": 4500,
        "occupancy": 0.889,
        "occupancyTop": 0.897,
        "listings": 1858,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 93.5,
        "seasonality": {
          "1": {
            "occupancy": 0.602,
            "price": 0.906
          },
          "2": {
            "occupancy": 0.768,
            "price": 0.904
          },
          "3": {
            "occupancy": 0.798,
            "price": 0.978
          },
          "4": {
            "occupancy": 1.034,
            "price": 1.062
          },
          "5": {
            "occupancy": 1.074,
            "price": 1.091
          },
          "6": {
            "occupancy": 0.974,
            "price": 1.087
          },
          "7": {
            "occupancy": 1.316,
            "price": 1.196
          },
          "8": {
            "occupancy": 1.658,
            "price": 1.049
          },
          "9": {
            "occupancy": 1.168,
            "price": 0.956
          },
          "10": {
            "occupancy": 1.059,
            "price": 0.94
          },
          "11": {
            "occupancy": 0.773,
            "price": 0.909
          },
          "12": {
            "occupancy": 0.774,
            "price": 0.921
          }
        }
      },
      "cannes": {
        "name": "Cannes",
        "price": 168.9,
        "m2": 5333,
        "occupancy": 0.578,
        "occupancyTop": 0.662,
        "listings": 8370,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 105.0,
        "seasonality": {
          "1": {
            "occupancy": 0.623,
            "price": 0.845
          },
          "2": {
            "occupancy": 0.785,
            "price": 0.87
          },
          "3": {
            "occupancy": 0.703,
            "price": 1.116
          },
          "4": {
            "occupancy": 0.942,
            "price": 0.975
          },
          "5": {
            "occupancy": 1.1,
            "price": 1.27
          },
          "6": {
            "occupancy": 1.051,
            "price": 1.214
          },
          "7": {
            "occupancy": 1.388,
            "price": 1.147
          },
          "8": {
            "occupancy": 1.726,
            "price": 1.017
          },
          "9": {
            "occupancy": 1.268,
            "price": 0.935
          },
          "10": {
            "occupancy": 0.896,
            "price": 0.91
          },
          "11": {
            "occupancy": 0.744,
            "price": 0.842
          },
          "12": {
            "occupancy": 0.773,
            "price": 0.859
          }
        }
      },
      "antibes": {
        "name": "Antibes",
        "price": 127.9,
        "m2": 4891,
        "occupancy": 0.8,
        "occupancyTop": 0.868,
        "listings": 4196,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 99.0,
        "seasonality": {
          "1": {
            "occupancy": 0.554,
            "price": 0.902
          },
          "2": {
            "occupancy": 0.796,
            "price": 0.908
          },
          "3": {
            "occupancy": 0.75,
            "price": 0.965
          },
          "4": {
            "occupancy": 0.966,
            "price": 1.0
          },
          "5": {
            "occupancy": 1.059,
            "price": 1.066
          },
          "6": {
            "occupancy": 1.13,
            "price": 1.13
          },
          "7": {
            "occupancy": 1.376,
            "price": 1.225
          },
          "8": {
            "occupancy": 1.622,
            "price": 1.109
          },
          "9": {
            "occupancy": 1.3,
            "price": 0.993
          },
          "10": {
            "occupancy": 1.021,
            "price": 0.927
          },
          "11": {
            "occupancy": 0.754,
            "price": 0.883
          },
          "12": {
            "occupancy": 0.672,
            "price": 0.892
          }
        }
      },
      "menton": {
        "name": "Menton",
        "price": 122.8,
        "m2": 4705,
        "occupancy": 0.911,
        "occupancyTop": 0.926,
        "listings": 1458,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 96.4,
        "seasonality": {
          "1": {
            "occupancy": 0.591,
            "price": 0.884
          },
          "2": {
            "occupancy": 0.954,
            "price": 0.937
          },
          "3": {
            "occupancy": 0.714,
            "price": 0.954
          },
          "4": {
            "occupancy": 1.038,
            "price": 1.021
          },
          "5": {
            "occupancy": 1.036,
            "price": 1.07
          },
          "6": {
            "occupancy": 1.043,
            "price": 1.183
          },
          "7": {
            "occupancy": 1.325,
            "price": 1.255
          },
          "8": {
            "occupancy": 1.606,
            "price": 1.072
          },
          "9": {
            "occupancy": 1.267,
            "price": 0.966
          },
          "10": {
            "occupancy": 1.023,
            "price": 0.899
          },
          "11": {
            "occupancy": 0.753,
            "price": 0.868
          },
          "12": {
            "occupancy": 0.649,
            "price": 0.892
          }
        }
      },
      "ajaccio": {
        "name": "Ajaccio",
        "price": 99.8,
        "m2": 3622,
        "occupancy": 0.756,
        "occupancyTop": 0.794,
        "listings": 1381,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 80.8,
        "seasonality": {
          "1": {
            "occupancy": 0.597,
            "price": 0.934
          },
          "2": {
            "occupancy": 0.675,
            "price": 0.939
          },
          "3": {
            "occupancy": 0.684,
            "price": 0.997
          },
          "4": {
            "occupancy": 0.95,
            "price": 1.018
          },
          "5": {
            "occupancy": 1.015,
            "price": 1.049
          },
          "6": {
            "occupancy": 1.122,
            "price": 1.093
          },
          "7": {
            "occupancy": 1.427,
            "price": 1.185
          },
          "8": {
            "occupancy": 1.732,
            "price": 1.069
          },
          "9": {
            "occupancy": 1.307,
            "price": 0.965
          },
          "10": {
            "occupancy": 1.006,
            "price": 0.926
          },
          "11": {
            "occupancy": 0.746,
            "price": 0.908
          },
          "12": {
            "occupancy": 0.738,
            "price": 0.917
          }
        }
      },
      "bastia": {
        "name": "Bastia",
        "price": 88.7,
        "m2": 2807,
        "occupancy": 0.8,
        "occupancyTop": 0.809,
        "listings": 457,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 67.9,
        "seasonality": {
          "1": {
            "occupancy": 0.555,
            "price": 0.912
          },
          "2": {
            "occupancy": 0.683,
            "price": 0.913
          },
          "3": {
            "occupancy": 0.796,
            "price": 0.998
          },
          "4": {
            "occupancy": 0.939,
            "price": 1.022
          },
          "5": {
            "occupancy": 1.027,
            "price": 1.05
          },
          "6": {
            "occupancy": 0.964,
            "price": 1.104
          },
          "7": {
            "occupancy": 1.321,
            "price": 1.212
          },
          "8": {
            "occupancy": 1.677,
            "price": 1.061
          },
          "9": {
            "occupancy": 1.276,
            "price": 0.973
          },
          "10": {
            "occupancy": 1.089,
            "price": 0.94
          },
          "11": {
            "occupancy": 0.828,
            "price": 0.908
          },
          "12": {
            "occupancy": 0.842,
            "price": 0.906
          }
        }
      },
      "arcachon": {
        "name": "Arcachon",
        "price": 125.4,
        "m2": 7700,
        "occupancy": 0.667,
        "occupancyTop": 0.735,
        "listings": 1726,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 134.6,
        "seasonality": {
          "1": {
            "occupancy": 0.506,
            "price": 0.923
          },
          "2": {
            "occupancy": 0.671,
            "price": 0.924
          },
          "3": {
            "occupancy": 0.702,
            "price": 0.97
          },
          "4": {
            "occupancy": 1.07,
            "price": 1.005
          },
          "5": {
            "occupancy": 1.029,
            "price": 1.04
          },
          "6": {
            "occupancy": 0.988,
            "price": 1.077
          },
          "7": {
            "occupancy": 1.488,
            "price": 1.242
          },
          "8": {
            "occupancy": 1.987,
            "price": 1.112
          },
          "9": {
            "occupancy": 1.17,
            "price": 0.972
          },
          "10": {
            "occupancy": 0.975,
            "price": 0.93
          },
          "11": {
            "occupancy": 0.723,
            "price": 0.897
          },
          "12": {
            "occupancy": 0.691,
            "price": 0.908
          }
        }
      },
      "versailles": {
        "name": "Versailles",
        "price": 108.3,
        "m2": 6884,
        "occupancy": 0.868,
        "occupancyTop": 0.883,
        "listings": 495,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 124.8,
        "seasonality": {
          "1": {
            "occupancy": 0.837,
            "price": 0.99
          },
          "2": {
            "occupancy": 0.907,
            "price": 0.986
          },
          "3": {
            "occupancy": 0.892,
            "price": 0.974
          },
          "4": {
            "occupancy": 1.097,
            "price": 0.984
          },
          "5": {
            "occupancy": 1.05,
            "price": 0.998
          },
          "6": {
            "occupancy": 1.063,
            "price": 1.012
          },
          "7": {
            "occupancy": 1.04,
            "price": 1.014
          },
          "8": {
            "occupancy": 1.016,
            "price": 1.008
          },
          "9": {
            "occupancy": 1.07,
            "price": 1.013
          },
          "10": {
            "occupancy": 1.142,
            "price": 1.015
          },
          "11": {
            "occupancy": 0.927,
            "price": 1.002
          },
          "12": {
            "occupancy": 0.959,
            "price": 1.004
          }
        }
      },
      "boulogne-billancourt": {
        "name": "Boulogne-Billancourt",
        "price": 131.4,
        "m2": 8837,
        "occupancy": 0.755,
        "occupancyTop": 0.87,
        "listings": 884,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 147.8,
        "seasonality": {
          "1": {
            "occupancy": 0.834,
            "price": 0.932
          },
          "2": {
            "occupancy": 0.872,
            "price": 0.928
          },
          "3": {
            "occupancy": 0.917,
            "price": 1.045
          },
          "4": {
            "occupancy": 1.042,
            "price": 1.064
          },
          "5": {
            "occupancy": 1.148,
            "price": 1.124
          },
          "6": {
            "occupancy": 1.093,
            "price": 1.128
          },
          "7": {
            "occupancy": 0.976,
            "price": 1.093
          },
          "8": {
            "occupancy": 0.859,
            "price": 0.927
          },
          "9": {
            "occupancy": 1.089,
            "price": 0.934
          },
          "10": {
            "occupancy": 1.128,
            "price": 0.942
          },
          "11": {
            "occupancy": 1.009,
            "price": 0.938
          },
          "12": {
            "occupancy": 1.032,
            "price": 0.945
          }
        }
      },
      "neuilly-sur-seine": {
        "name": "Neuilly-sur-Seine",
        "price": 151.8,
        "m2": 10943,
        "occupancy": 0.887,
        "occupancyTop": 0.922,
        "listings": 412,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 170.8,
        "seasonality": {
          "1": {
            "occupancy": 0.927,
            "price": 0.945
          },
          "2": {
            "occupancy": 0.925,
            "price": 0.944
          },
          "3": {
            "occupancy": 0.949,
            "price": 1.015
          },
          "4": {
            "occupancy": 1.018,
            "price": 1.062
          },
          "5": {
            "occupancy": 1.081,
            "price": 1.072
          },
          "6": {
            "occupancy": 1.061,
            "price": 1.099
          },
          "7": {
            "occupancy": 0.96,
            "price": 1.089
          },
          "8": {
            "occupancy": 0.859,
            "price": 0.948
          },
          "9": {
            "occupancy": 1.15,
            "price": 0.957
          },
          "10": {
            "occupancy": 1.101,
            "price": 0.958
          },
          "11": {
            "occupancy": 0.96,
            "price": 0.948
          },
          "12": {
            "occupancy": 1.01,
            "price": 0.963
          }
        }
      },
      "levallois-perret": {
        "name": "Levallois-Perret",
        "price": 120.3,
        "m2": 9571,
        "occupancy": 0.887,
        "occupancyTop": 0.935,
        "listings": 353,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 156.0,
        "seasonality": {
          "1": {
            "occupancy": 0.813,
            "price": 0.946
          },
          "2": {
            "occupancy": 0.976,
            "price": 0.941
          },
          "3": {
            "occupancy": 0.971,
            "price": 1.043
          },
          "4": {
            "occupancy": 1.062,
            "price": 1.059
          },
          "5": {
            "occupancy": 1.081,
            "price": 1.084
          },
          "6": {
            "occupancy": 1.084,
            "price": 1.097
          },
          "7": {
            "occupancy": 0.972,
            "price": 1.072
          },
          "8": {
            "occupancy": 0.86,
            "price": 0.936
          },
          "9": {
            "occupancy": 1.098,
            "price": 0.954
          },
          "10": {
            "occupancy": 1.14,
            "price": 0.963
          },
          "11": {
            "occupancy": 0.968,
            "price": 0.949
          },
          "12": {
            "occupancy": 0.974,
            "price": 0.956
          }
        }
      },
      "issy-les-moulineaux": {
        "name": "Issy-les-Moulineaux",
        "price": 112.6,
        "m2": 8150,
        "occupancy": 0.887,
        "occupancyTop": 0.935,
        "listings": 401,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 139.9,
        "seasonality": {
          "1": {
            "occupancy": 0.84,
            "price": 0.961
          },
          "2": {
            "occupancy": 0.938,
            "price": 0.961
          },
          "3": {
            "occupancy": 0.903,
            "price": 1.036
          },
          "4": {
            "occupancy": 1.019,
            "price": 1.061
          },
          "5": {
            "occupancy": 1.103,
            "price": 1.08
          },
          "6": {
            "occupancy": 1.086,
            "price": 1.088
          },
          "7": {
            "occupancy": 0.995,
            "price": 1.074
          },
          "8": {
            "occupancy": 0.903,
            "price": 0.934
          },
          "9": {
            "occupancy": 1.117,
            "price": 0.948
          },
          "10": {
            "occupancy": 1.188,
            "price": 0.954
          },
          "11": {
            "occupancy": 0.962,
            "price": 0.946
          },
          "12": {
            "occupancy": 0.946,
            "price": 0.957
          }
        }
      },
      "clichy": {
        "name": "Clichy",
        "price": 104.1,
        "m2": 7414,
        "occupancy": 1.057,
        "occupancyTop": 1.013,
        "listings": 589,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 131.2,
        "seasonality": {
          "1": {
            "occupancy": 0.802,
            "price": 0.939
          },
          "2": {
            "occupancy": 0.866,
            "price": 0.935
          },
          "3": {
            "occupancy": 0.955,
            "price": 1.034
          },
          "4": {
            "occupancy": 1.03,
            "price": 1.063
          },
          "5": {
            "occupancy": 1.053,
            "price": 1.077
          },
          "6": {
            "occupancy": 1.072,
            "price": 1.099
          },
          "7": {
            "occupancy": 0.973,
            "price": 1.083
          },
          "8": {
            "occupancy": 0.874,
            "price": 0.941
          },
          "9": {
            "occupancy": 1.142,
            "price": 0.958
          },
          "10": {
            "occupancy": 1.178,
            "price": 0.966
          },
          "11": {
            "occupancy": 1.047,
            "price": 0.949
          },
          "12": {
            "occupancy": 1.007,
            "price": 0.955
          }
        }
      },
      "courbevoie": {
        "name": "Courbevoie",
        "price": 104.1,
        "m2": 7143,
        "occupancy": 0.849,
        "occupancyTop": 0.922,
        "listings": 477,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 127.9,
        "seasonality": {
          "1": {
            "occupancy": 0.836,
            "price": 0.95
          },
          "2": {
            "occupancy": 0.911,
            "price": 0.941
          },
          "3": {
            "occupancy": 0.929,
            "price": 1.001
          },
          "4": {
            "occupancy": 1.052,
            "price": 1.045
          },
          "5": {
            "occupancy": 0.994,
            "price": 1.062
          },
          "6": {
            "occupancy": 1.092,
            "price": 1.08
          },
          "7": {
            "occupancy": 1.006,
            "price": 1.07
          },
          "8": {
            "occupancy": 0.919,
            "price": 0.961
          },
          "9": {
            "occupancy": 1.106,
            "price": 0.977
          },
          "10": {
            "occupancy": 1.09,
            "price": 0.976
          },
          "11": {
            "occupancy": 1.006,
            "price": 0.964
          },
          "12": {
            "occupancy": 1.061,
            "price": 0.972
          }
        }
      },
      "puteaux": {
        "name": "Puteaux",
        "price": 119.5,
        "m2": 7458,
        "occupancy": 0.887,
        "occupancyTop": 0.948,
        "listings": 318,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 131.7,
        "seasonality": {
          "1": {
            "occupancy": 0.863,
            "price": 0.937
          },
          "2": {
            "occupancy": 0.967,
            "price": 0.939
          },
          "3": {
            "occupancy": 0.883,
            "price": 1.012
          },
          "4": {
            "occupancy": 0.965,
            "price": 1.038
          },
          "5": {
            "occupancy": 1.093,
            "price": 1.067
          },
          "6": {
            "occupancy": 1.093,
            "price": 1.098
          },
          "7": {
            "occupancy": 0.989,
            "price": 1.085
          },
          "8": {
            "occupancy": 0.885,
            "price": 0.954
          },
          "9": {
            "occupancy": 1.027,
            "price": 0.976
          },
          "10": {
            "occupancy": 1.155,
            "price": 0.978
          },
          "11": {
            "occupancy": 1.005,
            "price": 0.953
          },
          "12": {
            "occupancy": 1.074,
            "price": 0.963
          }
        }
      },
      "montrouge": {
        "name": "Montrouge",
        "price": 107.4,
        "m2": 7627,
        "occupancy": 1.075,
        "occupancyTop": 1.0,
        "listings": 307,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 133.8,
        "seasonality": {
          "1": {
            "occupancy": 0.797,
            "price": 0.95
          },
          "2": {
            "occupancy": 0.918,
            "price": 0.948
          },
          "3": {
            "occupancy": 0.973,
            "price": 1.023
          },
          "4": {
            "occupancy": 1.059,
            "price": 1.055
          },
          "5": {
            "occupancy": 1.063,
            "price": 1.065
          },
          "6": {
            "occupancy": 1.088,
            "price": 1.075
          },
          "7": {
            "occupancy": 0.974,
            "price": 1.074
          },
          "8": {
            "occupancy": 0.86,
            "price": 0.947
          },
          "9": {
            "occupancy": 1.119,
            "price": 0.964
          },
          "10": {
            "occupancy": 1.142,
            "price": 0.972
          },
          "11": {
            "occupancy": 1.01,
            "price": 0.959
          },
          "12": {
            "occupancy": 0.996,
            "price": 0.968
          }
        }
      },
      "montreuil": {
        "name": "Montreuil",
        "price": 87.0,
        "m2": 6383,
        "occupancy": 0.868,
        "occupancyTop": 0.948,
        "listings": 770,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 118.6,
        "seasonality": {
          "1": {
            "occupancy": 0.825,
            "price": 0.946
          },
          "2": {
            "occupancy": 0.846,
            "price": 0.941
          },
          "3": {
            "occupancy": 0.927,
            "price": 1.039
          },
          "4": {
            "occupancy": 1.082,
            "price": 1.054
          },
          "5": {
            "occupancy": 1.056,
            "price": 1.065
          },
          "6": {
            "occupancy": 1.076,
            "price": 1.088
          },
          "7": {
            "occupancy": 0.989,
            "price": 1.083
          },
          "8": {
            "occupancy": 0.902,
            "price": 0.947
          },
          "9": {
            "occupancy": 1.113,
            "price": 0.964
          },
          "10": {
            "occupancy": 1.128,
            "price": 0.964
          },
          "11": {
            "occupancy": 1.02,
            "price": 0.951
          },
          "12": {
            "occupancy": 1.037,
            "price": 0.958
          }
        }
      },
      "saint-denis": {
        "name": "Saint-Denis",
        "price": 104.1,
        "m2": 4155,
        "occupancy": 0.755,
        "occupancyTop": 0.857,
        "listings": 987,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 88.6,
        "seasonality": {
          "1": {
            "occupancy": 0.871,
            "price": 0.938
          },
          "2": {
            "occupancy": 0.903,
            "price": 0.928
          },
          "3": {
            "occupancy": 0.864,
            "price": 1.021
          },
          "4": {
            "occupancy": 1.066,
            "price": 1.039
          },
          "5": {
            "occupancy": 0.956,
            "price": 1.085
          },
          "6": {
            "occupancy": 0.996,
            "price": 1.111
          },
          "7": {
            "occupancy": 0.979,
            "price": 1.114
          },
          "8": {
            "occupancy": 0.963,
            "price": 0.956
          },
          "9": {
            "occupancy": 1.177,
            "price": 0.95
          },
          "10": {
            "occupancy": 1.231,
            "price": 0.956
          },
          "11": {
            "occupancy": 0.953,
            "price": 0.947
          },
          "12": {
            "occupancy": 1.04,
            "price": 0.953
          }
        }
      },
      "saint-ouen-sur-seine": {
        "name": "Saint-Ouen-sur-Seine",
        "price": 101.5,
        "m2": 6647,
        "occupancy": 1.075,
        "occupancyTop": 0.987,
        "listings": 637,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 121.9,
        "seasonality": {
          "1": {
            "occupancy": 0.84,
            "price": 0.94
          },
          "2": {
            "occupancy": 0.93,
            "price": 0.937
          },
          "3": {
            "occupancy": 0.929,
            "price": 1.02
          },
          "4": {
            "occupancy": 1.131,
            "price": 1.064
          },
          "5": {
            "occupancy": 1.047,
            "price": 1.079
          },
          "6": {
            "occupancy": 1.027,
            "price": 1.1
          },
          "7": {
            "occupancy": 0.952,
            "price": 1.093
          },
          "8": {
            "occupancy": 0.877,
            "price": 0.945
          },
          "9": {
            "occupancy": 1.1,
            "price": 0.957
          },
          "10": {
            "occupancy": 1.179,
            "price": 0.964
          },
          "11": {
            "occupancy": 1.006,
            "price": 0.945
          },
          "12": {
            "occupancy": 0.982,
            "price": 0.957
          }
        }
      },
      "pantin": {
        "name": "Pantin",
        "price": 89.6,
        "m2": 6192,
        "occupancy": 0.943,
        "occupancyTop": 0.987,
        "listings": 409,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 116.1,
        "seasonality": {
          "1": {
            "occupancy": 0.865,
            "price": 0.944
          },
          "2": {
            "occupancy": 0.878,
            "price": 0.941
          },
          "3": {
            "occupancy": 0.943,
            "price": 1.049
          },
          "4": {
            "occupancy": 1.09,
            "price": 1.062
          },
          "5": {
            "occupancy": 1.068,
            "price": 1.076
          },
          "6": {
            "occupancy": 1.054,
            "price": 1.087
          },
          "7": {
            "occupancy": 0.952,
            "price": 1.088
          },
          "8": {
            "occupancy": 0.851,
            "price": 0.947
          },
          "9": {
            "occupancy": 1.113,
            "price": 0.949
          },
          "10": {
            "occupancy": 1.156,
            "price": 0.956
          },
          "11": {
            "occupancy": 1.017,
            "price": 0.949
          },
          "12": {
            "occupancy": 1.013,
            "price": 0.951
          }
        }
      },
      "vincennes": {
        "name": "Vincennes",
        "price": 104.1,
        "m2": 9021,
        "occupancy": 1.0,
        "occupancyTop": 0.987,
        "listings": 330,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 149.9,
        "seasonality": {
          "1": {
            "occupancy": 0.85,
            "price": 0.937
          },
          "2": {
            "occupancy": 0.846,
            "price": 0.928
          },
          "3": {
            "occupancy": 0.934,
            "price": 1.025
          },
          "4": {
            "occupancy": 1.118,
            "price": 1.059
          },
          "5": {
            "occupancy": 1.084,
            "price": 1.065
          },
          "6": {
            "occupancy": 1.11,
            "price": 1.101
          },
          "7": {
            "occupancy": 1.002,
            "price": 1.087
          },
          "8": {
            "occupancy": 0.894,
            "price": 0.942
          },
          "9": {
            "occupancy": 1.104,
            "price": 0.961
          },
          "10": {
            "occupancy": 1.079,
            "price": 0.973
          },
          "11": {
            "occupancy": 1.003,
            "price": 0.956
          },
          "12": {
            "occupancy": 0.977,
            "price": 0.966
          }
        }
      },
      "ivry-sur-seine": {
        "name": "Ivry-sur-Seine",
        "price": 87.0,
        "m2": 5189,
        "occupancy": 0.925,
        "occupancyTop": 0.961,
        "listings": 485,
        "period": [
          "2025-08",
          "2026-07"
        ],
        "modelPrice": 103.0,
        "seasonality": {
          "1": {
            "occupancy": 0.843,
            "price": 0.954
          },
          "2": {
            "occupancy": 0.946,
            "price": 0.942
          },
          "3": {
            "occupancy": 0.974,
            "price": 1.008
          },
          "4": {
            "occupancy": 1.014,
            "price": 1.032
          },
          "5": {
            "occupancy": 0.99,
            "price": 1.053
          },
          "6": {
            "occupancy": 0.994,
            "price": 1.083
          },
          "7": {
            "occupancy": 0.989,
            "price": 1.051
          },
          "8": {
            "occupancy": 0.984,
            "price": 0.97
          },
          "9": {
            "occupancy": 1.084,
            "price": 0.977
          },
          "10": {
            "occupancy": 1.116,
            "price": 0.982
          },
          "11": {
            "occupancy": 1.039,
            "price": 0.971
          },
          "12": {
            "occupancy": 1.027,
            "price": 0.976
          }
        }
      }
    },
    "anchorError": 0.149,
    "communes": 3284
  },
  "priceCorrection": {
    "paris": {
      "factor": 0.866,
      "listed": 188,
      "billed": 163.2,
      "source": "airroi"
    },
    "lyon": {
      "factor": 0.91,
      "listed": 101,
      "billed": 91.9,
      "source": "airroi"
    },
    "bordeaux": {
      "factor": 1.001,
      "listed": 100,
      "billed": 99.6,
      "source": "airroi"
    },
    "pays-basque": {
      "factor": 0.91,
      "source": "median"
    }
  }
} as const;
