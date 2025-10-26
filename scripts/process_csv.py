import csv
import json

def process_csv(csv_file_path, json_file_path):
    """
    Processes a CSV file to extract specific data about EAD courses and format it as a JSON file.

    Args:
        csv_file_path (str): The path to the input CSV file.
        json_file_path (str): The path to the output JSON file.
    """
    json_data = []
    required_columns = [
        "CO_CURSO", "NO_CURSO", "TP_GRAU_ACADEMICO", "NO_CINE_ROTULO",
        "NO_CINE_AREA_GERAL", "NO_CINE_AREA_ESPECIFICA", "NO_CINE_AREA_DETALHADA",
        "CO_IES", "NO_IES", "SG_IES", "NO_MUNICIPIO_IES", "SG_UF_IES", "IN_GRATUITO"
    ]

    try:
        with open(csv_file_path, mode='r', encoding='latin-1') as csv_file:
            csv_reader = csv.DictReader(csv_file, delimiter=';')

            # Check if all required columns are present
            header = csv_reader.fieldnames
            if not all(col in header for col in required_columns + ['TP_MODALIDADE_ENSINO']):
                print("Error: The CSV file is missing one or more required columns.")
                missing = [col for col in required_columns + ['TP_MODALIDADE_ENSINO'] if col not in header]
                print(f"Missing columns: {missing}")
                return

            for row in csv_reader:
                if row.get("TP_MODALIDADE_ENSINO") == '1':
                    course_data = {
                        "CO_CURSO": row.get("CO_CURSO", ""),
                        "NO_CURSO": row.get("NO_CURSO", ""),
                        "TP_GRAU_ACADEMICO": row.get("TP_GRAU_ACADEMICO", ""),
                        "NO_CINE_ROTULO": row.get("NO_CINE_ROTULO", ""),
                        "NO_CINE_AREA_GERAL": row.get("NO_CINE_AREA_GERAL", ""),
                        "NO_CINE_AREA_ESPECIFICA": row.get("NO_CINE_AREA_ESPECIFICA", ""),
                        "NO_CINE_AREA_DETALHADA": row.get("NO_CINE_AREA_DETALHADA", ""),
                        "NO_IES": row.get("NO_IES", ""),
                        "SG_UF_IES": row.get("SG_UF_IES", ""),
                        "NO_MUNICIPIO_IES": row.get("NO_MUNICIPIO_IES", ""),
                        "IN_GRATUITO": row.get("IN_GRATUITO", "")
                    }
                    json_data.append(course_data)

        with open(json_file_path, 'w', encoding='utf-8') as json_file:
            json.dump(json_data, json_file, indent=4, ensure_ascii=False)

        print(f"Successfully created {json_file_path}")

    except FileNotFoundError:
        print(f"Error: The file {csv_file_path} was not found.")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    # The user should place the CSV file in the 'scripts' directory
    # and then run this script.
    process_csv("scripts/MICRODADOS_CADASTRO_CURSOS_2024.CSV", "scripts/cursos.json")
