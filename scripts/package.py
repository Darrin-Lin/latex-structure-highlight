#!/usr/bin/env python3
"""Build a dependency-free local VSIX from the manifest's explicit file list."""
import json
from pathlib import Path
from xml.sax.saxutils import escape
from zipfile import ZipFile, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parent.parent
manifest = json.loads((ROOT / 'package.json').read_text())
messages = json.loads((ROOT / 'package.nls.json').read_text())
description = manifest['description']
if description.startswith('%') and description.endswith('%'):
    description = messages[description[1:-1]]
files = sorted({file for pattern in manifest['files'] for file in ROOT.glob(pattern) if file.is_file()})
for required in ['extension.js', 'package.json', 'LICENSE', 'THIRD_PARTY_NOTICES.md']:
    if ROOT / required not in files:
        raise ValueError('Missing required package file: ' + required)
if any(file.is_symlink() or not file.resolve().is_relative_to(ROOT) for file in files):
    raise ValueError('Package entries must be ordinary files inside the project')

def x(value):
    return escape(value, {'"': '&quot;'})

xml = f'''<?xml version="1.0" encoding="utf-8"?>
<PackageManifest Version="2.0.0" xmlns="http://schemas.microsoft.com/developer/vsx-schema/2011">
  <Metadata>
    <Identity Language="en-US" Id="{x(manifest['name'])}" Version="{x(manifest['version'])}" Publisher="{x(manifest['publisher'])}"/>
    <DisplayName>{x(manifest['displayName'])}</DisplayName>
    <Description xml:space="preserve">{x(description)}</Description>
    <Categories>Other</Categories>
    <Properties>
      <Property Id="Microsoft.VisualStudio.Code.Engine" Value="{x(manifest['engines']['vscode'])}"/>
      <Property Id="Microsoft.VisualStudio.Code.ExtensionKind" Value="workspace"/>
    </Properties>
  </Metadata>
  <Installation><InstallationTarget Id="Microsoft.VisualStudio.Code"/></Installation>
  <Dependencies/>
  <Assets>
    <Asset Type="Microsoft.VisualStudio.Code.Manifest" Path="extension/package.json" Addressable="true"/>
    <Asset Type="Microsoft.VisualStudio.Services.Content.Details" Path="extension/README.md" Addressable="true"/>
    <Asset Type="Microsoft.VisualStudio.Services.Content.License" Path="extension/LICENSE" Addressable="true"/>
  </Assets>
</PackageManifest>'''
types = '''<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="json" ContentType="application/json"/>
  <Default Extension="js" ContentType="application/javascript"/>
  <Default Extension="md" ContentType="text/markdown"/>
  <Default Extension="vsixmanifest" ContentType="text/xml"/>
  <Override PartName="/extension/LICENSE" ContentType="text/plain"/>
</Types>'''
out = ROOT / 'dist' / (manifest['name'] + '-' + manifest['version'] + '.vsix')
out.parent.mkdir(exist_ok=True)
with ZipFile(out, 'w', ZIP_DEFLATED) as archive:
    archive.writestr('extension.vsixmanifest', xml)
    archive.writestr('[Content_Types].xml', types)
    for file in files:
        archive.write(file, 'extension/' + file.relative_to(ROOT).as_posix())
with ZipFile(out) as archive:
    if archive.testzip() is not None:
        raise ValueError('Invalid VSIX archive')
    if archive.read('extension/THIRD_PARTY_NOTICES.md') != (ROOT / 'THIRD_PARTY_NOTICES.md').read_bytes():
        raise ValueError('Third-party notices were not packaged correctly')
print(out)
