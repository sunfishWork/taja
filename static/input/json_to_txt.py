import json

# JSON 파일 경로
json_file_path = 'R-REC-M.2150-2-202312-PDF-E.json'

# 출력할 텍스트 파일 경로
output_file_path = 'temp.txt'

# JSON 파일 열기 및 'text' 추출
with open(json_file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# 모든 text를 줄바꿈으로 이어붙임
all_text = '\n'.join(item['text'] for item in data)

# temp.txt 파일로 저장
with open(output_file_path, 'w', encoding='utf-8') as f:
    f.write(all_text)

print(f"text 필드만 추출하여 '{output_file_path}'에 저장 완료.")