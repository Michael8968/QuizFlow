import { useEffect, useRef, useState, useCallback } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface QRScannerProps {
  open: boolean
  onClose: () => void
  onScanSuccess: (code: string) => void
}

export function QRScanner({ open, onClose, onScanSuccess }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  const stopScanning = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      } catch (err) {
        // 忽略停止时的错误
      }
      scannerRef.current = null
    }
    setIsScanning(false)
  }, [])

  const startScanning = useCallback(async () => {
    try {
      setError(null)
      setIsScanning(true)

      // 检查摄像头权限
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        stream.getTracks().forEach(track => track.stop())
        setHasPermission(true)
      } catch (err) {
        setHasPermission(false)
        setError('无法访问摄像头，请检查权限设置')
        setIsScanning(false)
        return
      }

      const scannerId = 'qr-reader'
      
      // 如果已经存在实例，先清理
      if (scannerRef.current) {
        await stopScanning()
      }

      scannerRef.current = new Html5Qrcode(scannerId)

      // 计算适合移动端的扫描框大小
      const qrboxSize = Math.min(250, window.innerWidth * 0.7)

      await scannerRef.current.start(
        { facingMode: 'environment' }, // 使用后置摄像头
        {
          fps: 10,
          qrbox: { width: qrboxSize, height: qrboxSize },
        },
        (decodedText) => {
          // 扫描成功
          onScanSuccess(decodedText)
          stopScanning()
          onClose()
        },
        () => {
          // 扫描错误（忽略，继续扫描）
        }
      )
    } catch (err) {
      console.error('启动扫描器失败:', err)
      setError(err instanceof Error ? err.message : '启动扫描器失败')
      setIsScanning(false)
    }
  }, [onScanSuccess, onClose, stopScanning])

  useEffect(() => {
    if (!open) {
      // 关闭时停止扫描
      stopScanning()
      return
    }

    // 打开时开始扫描
    startScanning()

    return () => {
      stopScanning()
    }
  }, [open, startScanning, stopScanning])

  const handleClose = () => {
    stopScanning()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-full p-0 gap-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>扫描二维码</DialogTitle>
          <DialogDescription>
            将二维码对准扫描框，系统将自动识别
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6">
          {error ? (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-sm text-red-600">{error}</p>
              </div>
              {hasPermission === false && (
                <Button
                  onClick={startScanning}
                  className="w-full"
                  variant="outline"
                >
                  重试
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden" style={{ minHeight: '300px', width: '100%' }}>
                {isScanning ? (
                  <div id="qr-reader" className="w-full" style={{ minHeight: '300px' }}></div>
                ) : (
                  <div className="flex items-center justify-center h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
              <p className="text-xs text-center text-gray-500">
                请确保二维码清晰可见，光线充足
              </p>
            </div>
          )}

          <Button
            onClick={handleClose}
            variant="outline"
            className="w-full mt-4"
          >
            取消
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

