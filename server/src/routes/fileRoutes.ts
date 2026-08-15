import { Router } from 'express';
import { FileController, uploadMulter } from '../controllers/fileController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateJWT);

router.post('/upload', uploadMulter.single('file'), FileController.uploadFile);
router.get('/', FileController.listFiles);
router.get('/stats/quota', FileController.getQuotaStats);
router.get('/:id', FileController.getFile);
router.get('/:id/download', FileController.downloadFile);
router.delete('/:id', FileController.deleteFile);
router.post('/:id/version', uploadMulter.single('file'), FileController.uploadNewVersion);
router.get('/:id/versions', FileController.getFileVersions);

export default router;
