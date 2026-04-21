#!/usr/bin/env python3
"""Regenerates js/data.js from the JSON data files in this directory."""

import json

files = {
    'historical_inflation':   'historical_inflation.json',
    'sp_500':                 'sp_500.json',
    'small_cap':              'small_cap.json',
    'bonds_80_sp_20':         '80_bonds_20_sp.json',
    'bonds_80_sp_10_intl_10': '80_bonds_10_sp_10_intl.json',
    'bonds_60_sp_20_intl_20': '60_bonds_20_sp_20_intl.json',
    'bonds_40_sp_30_intl_30': '40_bonds_30_sp_30_intl.json',
    'equal_5way':             '20_bonds_20_sp_20_intl_20_mid_20_small.json',
    'equal_4way':             '25_sp_25_intl_25_mid_25_small.json',
}

lines = ['// Auto-generated from JSON data files — do not edit by hand', 'const DATA = {']
for key, fname in files.items():
    with open(fname) as f:
        data = json.load(f)
    lines.append(f'  {key}: {json.dumps(data)},')
lines.append('};')

output = '\n'.join(lines) + '\n'
with open('js/data.js', 'w') as f:
    f.write(output)

print('js/data.js regenerated successfully.')
