"""
Google Drive에서 모델 파일 다운로드

배포 환경(Render 등)에서 서버 시작 시 자동으로 모델을 다운로드합니다.
"""
import os
import requests
from pathlib import Path


def download_file_from_google_drive(file_id: str, destination: Path):
    """Google Drive에서 파일 다운로드"""

    def get_confirm_token(response):
        for key, value in response.cookies.items():
            if key.startswith('download_warning'):
                return value
        return None

    def save_response_content(response, destination):
        CHUNK_SIZE = 32768
        with open(destination, "wb") as f:
            for chunk in response.iter_content(CHUNK_SIZE):
                if chunk:
                    f.write(chunk)

    URL = "https://docs.google.com/uc?export=download"
    session = requests.Session()

    response = session.get(URL, params={'id': file_id}, stream=True)
    token = get_confirm_token(response)

    if token:
        params = {'id': file_id, 'confirm': token}
        response = session.get(URL, params=params, stream=True)

    save_response_content(response, destination)


def download_model():
    """모델 파일이 없으면 Google Drive에서 다운로드"""

    # 모델 파일 경로
    model_path = Path(__file__).parent.parent / "models" / "final_model.pth"

    # 이미 파일이 있으면 다운로드 스킵
    if model_path.exists():
        file_size_mb = model_path.stat().st_size / (1024 * 1024)
        print(f"✅ Model file already exists: {model_path}")
        print(f"   File size: {file_size_mb:.1f} MB")
        return

    # models 디렉토리 생성
    model_path.parent.mkdir(parents=True, exist_ok=True)

    # Google Drive 파일 ID
    file_id = "1w2YZshCed4vF1GHc0lbpsIapfj47akgP"

    print(f"📥 Downloading model from Google Drive...")
    print(f"   Destination: {model_path}")

    try:
        download_file_from_google_drive(file_id, model_path)

        # 다운로드 완료 확인
        if model_path.exists():
            file_size_mb = model_path.stat().st_size / (1024 * 1024)
            print(f"✅ Model downloaded successfully!")
            print(f"   File size: {file_size_mb:.1f} MB")
        else:
            print(f"❌ Model download failed: File not found after download")

    except Exception as e:
        print(f"❌ Failed to download model: {e}")
        print(f"   Please download manually from:")
        print(f"   https://drive.google.com/file/d/{file_id}/view")
        raise


if __name__ == "__main__":
    download_model()
