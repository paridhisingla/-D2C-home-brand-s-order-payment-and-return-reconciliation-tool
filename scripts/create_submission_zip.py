import zipfile
import os

def create_zips():
    # 1. Create submission.zip (Documentation Deliverables per User Request)
    docs_to_include = [
        "Technical_Design_Document.docx",
        "TECHNICAL_DESIGN_DOCUMENT.md",
        "deployment.md",
        "README.md",
        "render.yaml"
    ]
    
    submission_zip_path = "submission.zip"
    with zipfile.ZipFile(submission_zip_path, "w", zipfile.ZIP_DEFLATED) as z:
        for f in docs_to_include:
            if os.path.exists(f):
                z.write(f, arcname=f)
                print(f"Added {f} to {submission_zip_path}")
            else:
                print(f"Warning: {f} not found!")

    print(f"\n{submission_zip_path} created successfully. Size: {os.path.getsize(submission_zip_path)} bytes.")

    # 2. Create full source zip (excluding node_modules, .next, .git)
    full_zip_path = "knittrack_complete_project.zip"
    exclude_dirs = {"node_modules", ".next", ".git"}
    exclude_files = {submission_zip_path, full_zip_path}

    with zipfile.ZipFile(full_zip_path, "w", zipfile.ZIP_DEFLATED) as z:
        for root, dirs, files in os.walk("."):
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            for file in files:
                rel_path = os.path.normpath(os.path.join(root, file))
                if file in exclude_files:
                    continue
                z.write(rel_path, arcname=rel_path)
    
    print(f"\n{full_zip_path} created successfully. Size: {os.path.getsize(full_zip_path)} bytes.")

if __name__ == "__main__":
    create_zips()
