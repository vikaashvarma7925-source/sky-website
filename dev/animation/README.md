# Local face-render experiment
This is a development note, not a shipped model runtime.

Tested with official LivePortrait human models and PyTorch 2.3.0+cpu. No InsightFace models or external image upload used. Manual face crop supplied. Important memory changes: convert heavy model weights to bfloat16; use CPU bfloat16 autocast with output float conversion; extract source features and keypoints, then delete source extractor/motion modules; gc.collect and malloc_trim before decoder. ~1.1GiB peak RSS for one frame, ~3s/frame after first load on tested host. Stock FP32 exceeded 1.45GB safety cap.

local-render-tested.py records the tested eye-retargeting experiment with these memory changes. Its input/output paths are local experiment paths and must be changed for another environment. It is not a production pipeline. Preserve MIT attribution from official source. Model code/source: https://github.com/KlingAIResearch/LivePortrait/ . Restricted InsightFace detector weights must not be introduced into commercial use.

Outputs are pre-rendered reconstructed 2D face frames composited over static body photo. No body rig, no 360, no phoneme synchronization, no reference-voice cloning. Main page default stays original photo. The separate /aura/lab/ page is explicitly experimental.
