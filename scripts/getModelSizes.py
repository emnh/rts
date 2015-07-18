#!/usr/bin/env python
# -*- coding: utf-8 -*-
# vim: ft=python ts=4 sw=4 sts=4 et fenc=utf-8
# Original author: "Eivind Magnus Hvidevold" <hvidevold@gmail.com>
# License: GNU GPLv3 at http://www.gnu.org/licenses/gpl.html

'''
'''

import os
import sys
import re
import json

def main():
    modelPath = 'models/3d'
    imagePath = 'models/images'
    models = {}
    images = {}
    export = {
            "models": models,
            "images": images
    }
    for fname in os.listdir(modelPath):
        dname = os.path.join(modelPath, fname)
        size = os.path.getsize(dname)
        models[dname] = size
    for fname in os.listdir(imagePath):
        dname = os.path.join(imagePath, fname)
        size = os.path.getsize(dname)
        images[dname] = size
    j = json.dumps(export, sort_keys=True, indent=2, separators=(',', ': '))
    print j

    'entry point'

if __name__ == '__main__':
    main()

