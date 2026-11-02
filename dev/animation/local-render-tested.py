import time,torch,cv2,resource
from src.config.inference_config import InferenceConfig
from src.live_portrait_wrapper import LivePortraitWrapper
from src.utils.camera import get_rotation_matrix
torch.set_num_threads(2)
t=time.time(); cfg=InferenceConfig(flag_force_cpu=True,flag_use_half_precision=True)
w=LivePortraitWrapper(cfg); w.inference_ctx=lambda: torch.autocast(device_type="cpu",dtype=torch.bfloat16);
for m in [w.appearance_feature_extractor,w.motion_extractor,w.warping_module,w.spade_generator]: m.to(dtype=torch.bfloat16)
print('LOADED',time.time()-t,resource.getrusage(resource.RUSAGE_SELF).ru_maxrss,flush=True)
im=cv2.imread('/tmp/qa17_face.jpg'); x=w.prepare_source(cv2.cvtColor(im,cv2.COLOR_BGR2RGB))
k=w.get_kp_info(x); r=get_rotation_matrix(k['pitch'],k['yaw'],k['roll']); kp=k['scale']*(k['kp']@r+k['exp'])+k['t']
f=w.extract_feature_3d(x);print('EXTRACTED',time.time()-t,resource.getrusage(resource.RUSAGE_SELF).ru_maxrss,flush=True)
del w.appearance_feature_extractor,w.motion_extractor
import gc;gc.collect()
import ctypes;ctypes.CDLL('libc.so.6').malloc_trim(0)
import os
os.makedirs('/tmp/animation-feasibility/frames',exist_ok=True)
for i,ratio in enumerate([0.35,0.2,0.05,0.01,0.05,0.2,0.35]):
 delta=w.retarget_eye(kp,torch.tensor([[0.35,0.35,ratio]],dtype=torch.float32))
 kd=w.stitching(kp,kp+delta)
 out=w.warp_decode(f,kp,kd)
 frame=w.parse_output(out['out'])[0]
 cv2.imwrite(f'/tmp/animation-feasibility/blink-{i}.jpg',cv2.cvtColor(frame,cv2.COLOR_RGB2BGR))
 print('BLINK',i,time.time()-t,flush=True)
 del out;gc.collect();ctypes.CDLL('libc.so.6').malloc_trim(0)
