#!/usr/bin/env python3
"""Read-only cloud-worker capability report. Does not render or install packages.

Run on the selected Linux cloud worker, using its Blender Python environment:
    python3 scripts/acquisition-worker-check.py
Exit 2 means a required executable/module is missing; GPU absence is reported
separately because the proxy lane may run on a cloud CPU.
"""
import importlib.util
import json
import platform
import shutil
import subprocess
import sys


def main():
    if platform.system() != "Linux":
        print("Cloud Linux worker required. No render or device probe was started.", file=sys.stderr)
        return 2
    report = {
        "system": platform.platform(),
        "python": platform.python_version(),
        "executables": {name: shutil.which(name) for name in ("node", "npm", "ffmpeg", "ffprobe", "git")},
        "blender": None,
        "cycles": [],
        "gpuAvailable": False,
        "benchmark": "NOT RUN",
    }
    if shutil.which("nvidia-smi"):
        result = subprocess.run(
            ["nvidia-smi", "--query-gpu=name,memory.total,driver_version", "--format=csv,noheader"],
            capture_output=True, text=True, timeout=20)
        report["nvidia"] = {"exitCode": result.returncode, "devices": result.stdout.strip()}
    if importlib.util.find_spec("bpy"):
        import bpy
        report["blender"] = bpy.app.version_string
        addon = bpy.context.preferences.addons.get("cycles")
        if addon:
            preferences = addon.preferences
            original = preferences.compute_device_type
            try:
                for backend in ("OPTIX", "CUDA", "HIP", "ONEAPI"):
                    try:
                        preferences.compute_device_type = backend
                        preferences.refresh_devices()
                        devices = [{"name": item.name, "type": item.type} for item in preferences.devices]
                        report["cycles"].append({"backend": backend, "devices": devices})
                        report["gpuAvailable"] |= any(item["type"] != "CPU" for item in devices)
                    except (TypeError, ValueError, RuntimeError) as error:
                        report["cycles"].append({"backend": backend, "unavailable": str(error)})
            finally:
                preferences.compute_device_type = original
    report["dependenciesReady"] = bool(report["blender"]) and all(report["executables"].values())
    print(json.dumps(report, indent=2))
    return 0 if report["dependenciesReady"] else 2


if __name__ == "__main__":
    sys.exit(main())
