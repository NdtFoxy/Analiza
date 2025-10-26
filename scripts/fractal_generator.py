import sys
import json
import numpy as np
import math



FRACTALS = {
    "1": {
        "name": "Barnsley Fern",
        "params": {
            'f1': {'coeffs': (0.00, 0.00, 0.00, 0.16, 0.00, 0.00), 'prob': 0.01},
            'f2': {'coeffs': (0.85, 0.04, -0.04, 0.85, 0.00, 1.60), 'prob': 0.85},
            'f3': {'coeffs': (0.20, -0.26, 0.23, 0.22, 0.00, 1.60), 'prob': 0.07},
            'f4': {'coeffs': (-0.15, 0.28, 0.26, 0.24, 0.00, 0.44), 'prob': 0.07}
        }
    },
    "2": {
        "name": "Sierpinski Gasket",
        "params": {
            'f1': {'coeffs': (0.5, 0, 0, 0.5, 0, 0), 'prob': 1/3},
            'f2': {'coeffs': (0.5, 0, 0, 0.5, 0.5, 0), 'prob': 1/3},
            'f3': {'coeffs': (0.5, 0, 0, 0.5, 0.25, 0.5), 'prob': 1/3}
        }
    },
    "3": {
        "name": "Heighway Dragon",
        "params": {
            'f1': {'coeffs': (0.5, -0.5, 0.5, 0.5, 0, 0), 'prob': 0.5},
            'f2': {'coeffs': (-0.5, -0.5, 0.5, -0.5, 1, 0), 'prob': 0.5}
        }
    },
    "4": {
        "name": "Crystal",
        "params": {
            'f1': {'coeffs': (0.333, 0, 0, 0.333, 0.333, 0), 'prob': 0.2},
            'f2': {'coeffs': (0.333, 0, 0, 0.333, 0, 0.333), 'prob': 0.2},
            'f3': {'coeffs': (0.333, 0, 0, 0.333, 0.666, 0.333), 'prob': 0.2},
            'f4': {'coeffs': (0.333, 0, 0, 0.333, 0.333, 0.666), 'prob': 0.2},
            'f5': {'coeffs': (0.333, 0, 0, 0.333, 0.333, 0.333), 'prob': 0.2}
        }
    },
    "5": {
        "name": "Maple Leaf",
        "params": {
            'f1': {'coeffs': (0.14, 0.01, 0, 0.51, -0.08, -1.31), 'prob': 0.15},
            'f2': {'coeffs': (0.43, 0.52, -0.45, 0.5, 1.49, -0.75), 'prob': 0.35},
            'f3': {'coeffs': (0.45, -0.49, 0.47, 0.47, -1.62, -0.74), 'prob': 0.35},
            'f4': {'coeffs': (0.49, 0, 0, 0.51, 0.02, 1.62), 'prob': 0.15}
        }
    },
    "6": {
        "name": "Sierpinski Carpet",
        "params": {
            'f1': {'coeffs': (1/3, 0, 0, 1/3, 0, 0), 'prob': 1/8},
            'f2': {'coeffs': (1/3, 0, 0, 1/3, 1/3, 0), 'prob': 1/8},
            'f3': {'coeffs': (1/3, 0, 0, 1/3, 2/3, 0), 'prob': 1/8},
            'f4': {'coeffs': (1/3, 0, 0, 1/3, 0, 1/3), 'prob': 1/8},
            'f5': {'coeffs': (1/3, 0, 0, 1/3, 2/3, 1/3), 'prob': 1/8},
            'f6': {'coeffs': (1/3, 0, 0, 1/3, 0, 2/3), 'prob': 1/8},
            'f7': {'coeffs': (1/3, 0, 0, 1/3, 1/3, 2/3), 'prob': 1/8},
            'f8': {'coeffs': (1/3, 0, 0, 1/3, 2/3, 2/3), 'prob': 1/8}
        }
    },
    "7": {
        "name": "Levy Dragon",
        "params": {
            'f1': {'coeffs': (0.5, -0.5, 0.5, 0.5, 0, 0), 'prob': 0.5},
            'f2': {'coeffs': (0.5, 0.5, -0.5, 0.5, 0.5, 0.5), 'prob': 0.5}
        }
    },
    "8": {
        "name": "Pythagorean Tree",
        "params": {
             "f1": {"coeffs": (0, 0, 0, 0.5, 0, 0), "prob": 0.05},
        "f2": {"coeffs": (0.3535, -0.3535, 0.3535, 0.3535, 0, 0.5), "prob": 0.475},
        "f3": {"coeffs": (0.3535, 0.3535, -0.3535, 0.3535, 0.3535, 0.8535), "prob": 0.475}
        }
    },
    "9": {
        "name": "Koch Curve",
        "params": {
            'f1': {'coeffs': (1/3, 0, 0, 1/3, 0, 0), 'prob': 0.25},
            'f2': {'coeffs': (1/6, -math.sqrt(3)/6, math.sqrt(3)/6, 1/6, 1/3, 0), 'prob': 0.25},
            'f3': {'coeffs': (1/6, math.sqrt(3)/6, -math.sqrt(3)/6, 1/6, 1/2, math.sqrt(3)/6), 'prob': 0.25},
            'f4': {'coeffs': (1/3, 0, 0, 1/3, 2/3, 0), 'prob': 0.25}
        }
    },
    "10": {
        "name": "Sierpinski Pentagon",
        "params": {
            'f1': {'coeffs': (0.381966, 0, 0, 0.381966, 0, 0), 'prob': 0.2},
            'f2': {'coeffs': (0.381966, 0, 0, 0.381966, 0.618034, 0), 'prob': 0.2},
            'f3': {'coeffs': (0.381966, 0, 0, 0.381966, 0.809017, 0.587785), 'prob': 0.2},
            'f4': {'coeffs': (0.381966, 0, 0, 0.381966, 0.309017, 0.951057), 'prob': 0.2},
            'f5': {'coeffs': (0.381966, 0, 0, 0.381966, -0.190983, 0.587785), 'prob': 0.2}
        }
    },
    "11": {
        "name": "McWorter's Pentigree",
        "params": {
            'f1': {'coeffs': (0.309, -0.225, 0.225, 0.309, 0, 0), 'prob': 1/6},
            'f2': {'coeffs': (-0.118, -0.363, 0.363, -0.118, 0.309, 0.225), 'prob': 1/6},
            'f3': {'coeffs': (0.309, 0.225, -0.225, 0.309, 0.191, 0.588), 'prob': 1/6},
            'f4': {'coeffs': (-0.118, 0.363, -0.363, -0.118, 0.5, 0.363), 'prob': 1/6},
            'f5': {'coeffs': (0.309, 0.225, -0.225, 0.309, 0.382, 0), 'prob': 1/6},
            'f6': {'coeffs': (0.309, -0.225, 0.225, 0.309, 0.691, -0.225), 'prob': 1/6}
        }
    },
    "12": {
        "name": "Symmetric Binary Tree",
        "params": {
            "f1": {"coeffs": (0, 0, 0, 0.5, 0, 0), "prob": 0.05},
            "f2": {"coeffs": (0.42, -0.42, 0.42, 0.42, 0, 0.5), "prob": 0.475},
            "f3": {"coeffs": (0.42, 0.42, -0.42, 0.42, 0, 0.5), "prob": 0.475}
        }
    },
    "13": {
        "name": "Koch Snowflake",
        "params": {
            'f1': {'coeffs': (0.5, -math.sqrt(3)/6, math.sqrt(3)/6, 0.5, 0, 0), 'prob': 1/7},
            'f2': {'coeffs': (1/3, 0, 0, 1/3, 1/math.sqrt(3), 1/3), 'prob': 1/7},
            'f3': {'coeffs': (1/3, 0, 0, 1/3, 0, 2/3), 'prob': 1/7},
            'f4': {'coeffs': (1/3, 0, 0, 1/3, -1/math.sqrt(3), 1/3), 'prob': 1/7},
            'f5': {'coeffs': (1/3, 0, 0, 1/3, -1/math.sqrt(3), -1/3), 'prob': 1/7},
            'f6': {'coeffs': (1/3, 0, 0, 1/3, 0, -2/3), 'prob': 1/7},
            'f7': {'coeffs': (1/3, 0, 0, 1/3, 1/math.sqrt(3), -1/3), 'prob': 1/7}
        }
    },
    "14": {
        "name": "Terdragon",
        "params": {
            'f1': {'coeffs': (0.5, -0.2887, 0.2887, 0.5, 0, 0), 'prob': 1/3},
            'f2': {'coeffs': (0.5, -0.2887, 0.2887, 0.5, 0.5, 0.2887), 'prob': 1/3},
            'f3': {'coeffs': (0.5, -0.2887, 0.2887, 0.5, 0.25, -0.1443), 'prob': 1/3}
        }
    },
    "15": {
        "name": "Twin Dragon",
        "params": {
            'f1': {'coeffs': (0.5, -0.5, 0.5, 0.5, 0, 0), 'prob': 0.5},
            'f2': {'coeffs': (0.5, -0.5, 0.5, 0.5, 1, 0), 'prob': 0.5}
        }
    },
    "16": {
        "name": "Spiral",
        "params": {
            'f1': {'coeffs': (0.787879, -0.424242, 0.242424, 0.859848, 1.758647, 1.408065), 'prob': 0.9},
            'f2': {'coeffs': (-0.121212, 0.257576, 0.151515, 0.053030, -6.721654, 1.377236), 'prob': 0.05},
            'f3': {'coeffs': (0.181818, -0.136364, 0.090909, 0.181818, 6.086107, 1.568035), 'prob': 0.05}
        }
    }
}


def generate_ifs_points(transformations, iterations=200000, burn_in=100):

    trans_keys = list(transformations.keys())
    probabilities = [transformations[k]['prob'] for k in trans_keys]
    
    matrices, vectors = [], []
    for key in trans_keys:
        a, b, c, d, e, f = transformations[key]['coeffs']
        matrices.append(np.array([[a, b], [c, d]]))
        vectors.append(np.array([e, f]))
    
    if not np.isclose(sum(probabilities), 1.0, atol=1e-5):
        print(json.dumps({
            "error": f"Sum of probabilities is {sum(probabilities)}, should be 1.0"
        }))
        sys.exit(1)
    
    point = np.array([0.0, 0.0])
    output_size = iterations - burn_in
    x_coords = np.zeros(output_size)
    y_coords = np.zeros(output_size)
    point_colors = np.zeros(output_size, dtype=int)
    
    for i in range(iterations):
        choice_index = np.random.choice(len(trans_keys), p=probabilities)
        matrix = matrices[choice_index]
        vector = vectors[choice_index]
        
        point = np.dot(matrix, point) + vector
        
        if i >= burn_in:
            idx = i - burn_in
            x_coords[idx] = point[0]
            y_coords[idx] = point[1]
            point_colors[idx] = choice_index
    
    return x_coords, y_coords, point_colors


def main():
    
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No fractal key provided"}))
        sys.exit(1)
    
    fractal_key = sys.argv[1]
    
    desired_points = 100000
    
    if len(sys.argv) >= 3:
        try:
            desired_points = int(sys.argv[2])
            
            if desired_points < 1000:
                desired_points = 1000
            elif desired_points > 1000000:
                desired_points = 1000000
        except ValueError:
            print(json.dumps({"error": f"Invalid points: '{sys.argv[2]}'"}))
            sys.exit(1)
    
    if fractal_key not in FRACTALS:
        print(json.dumps({
            "error": f"Fractal '{fractal_key}' not found"
        }))
        sys.exit(1)
    
    fractal_info = FRACTALS[fractal_key]
    params = fractal_info.get('params')
    
    burn_in = 100
    total_iterations = desired_points + burn_in
    
    x, y, c = generate_ifs_points(params, iterations=total_iterations, burn_in=burn_in)
    
    result = {
        "name": fractal_info['name'],
        "x": x.tolist(),
        "y": y.tolist(),
        "colors": c.tolist()
    }
    
    print(json.dumps(result))


if __name__ == "__main__":
    main()