// Importamos React y los hooks useState y useEffect pa manejar el estado y cosas
import React, { useState, useEffect } from 'react';
// Importamos componentes básicos de React Native pa armar la interfaz
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
// Importamos uuid pa generar IDs únicos pa cada tarea
import uuid from 'react-native-uuid';
// Importamos AsyncStorage pa guardar datos en el celular
import AsyncStorage from '@react-native-async-storage/async-storage';
// Importamos iconos de AntDesign pa usar en la app
import { AntDesign } from '@expo/vector-icons';

// Componente principal de la app
export default function App() {
  // Estado pa guardar el texto de la tarea nueva que el usuario escribe
  const [tarea, setTarea] = useState('');
  // Estado pa guardar la lista de tareas
  const [tareas, setTareas] = useState([]);

  // Array de colores pa que cada tarjeta de tarea tenga un color distinto
  const coloresTarjetas = ['#EAD1DC', '#C6E2E9', '#D1E8D1', '#FFFACD', '#D1D1E8', '#FFD1DC', '#BFD8D2'];

  // useEffect que corre una vez cuando el componente se monta
  useEffect(() => {
    cargarTareas(); // Llamamos a la función pa cargar las tareas guardadas
  }, []);

  // useEffect que corre cada vez que cambian las tareas
  useEffect(() => {
    guardarTareas(); // Guardamos las tareas cada vez que se actualizan
  }, [tareas]);

  // Función pa cargar las tareas desde AsyncStorage
  const cargarTareas = async () => {
    try {
      // Obtenemos las tareas guardadas con la clave tareas
      const tareasGuardadas = await AsyncStorage.getItem('tareas');
      if (tareasGuardadas) {
        // Si hay tareas guardadas, las parseamos de JSON y actualizamos el estado
        setTareas(JSON.parse(tareasGuardadas));
      }
    } catch (e) {
      // Si hay un error, lo mostramos en la consola
      console.log(e);
    }
  };

  // Función pa guardar las tareas en AsyncStorage
  const guardarTareas = async () => {
    try {
      // Convertimos el array de tareas a una cadena JSON
      const jsonValue = JSON.stringify(tareas);
      // Guardamos la cadena JSON con la clave tareas
      await AsyncStorage.setItem('tareas', jsonValue);
    } catch (e) {
      // Si hay un error, lo mostramos en la consola
      console.log(e);
    }
  };

  // Función pa agregar una nueva tarea a la lista
  const agregarTarea = () => {
    // Verificamos que el texto de la tarea no esté vacío después de quitar espacios
    if (tarea.trim()) {
      // Creamos una nueva tarea con un id único, el texto ingresado y completada en false
      const nuevaTarea = { id: uuid.v4(), texto: tarea, completada: false };
      // Actualizamos el estado tareas agregando la nueva tarea al array existente
      setTareas([...tareas, nuevaTarea]);
      // Limpiamos el campo de entrada de texto
      setTarea('');
    }
  };

  // Función pa alternar el estado de completada de una tarea específica
  const toggleCompletada = (id) => {
    // Actualizamos el estado tareas mapeando cada tarea
    setTareas(
      tareas.map(tarea =>
        tarea.id === id
          ? { ...tarea, completada: !tarea.completada } // Si el ID coincide, cambiamos el estado completada
          : tarea // Si no, dejamos la tarea igual
      )
    );
  };

  // Función pa eliminar una tarea específica de la lista
  const eliminarTarea = (id) => {
    // Filtramos las tareas excluyendo la que tiene el ID proporcionado
    setTareas(tareas.filter(t => t.id !== id));
  };

  // Renderizamos la interfaz de usuario
  return (
    <View style={styles.contenedorPrincipal}>
      {/* Título de la aplicación */}
      <Text style={styles.titulo}>Aplicación de Tareas</Text>

      {/* Formulario pa ingresar una nueva tarea */}
      <View style={styles.formulario}>
        {/* Campo de entrada de texto pa la tarea */}
        <TextInput
          style={styles.input}
          placeholder="Ingresa una tarea" // Texto que aparece cuando el campo está vacío
          value={tarea} // Valor del campo ligado al estado tarea
          onChangeText={setTarea} // Función que actualiza el estado tarea con el texto ingresado
        />
        {/* Botón pa agregar la tarea */}
        <TouchableOpacity style={styles.botonAgregar} onPress={agregarTarea}>
          <Text style={styles.textoBoton}>Add Tarea</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de tareas usando FlatList pa mejor performance */}
      <FlatList
        data={tareas} // Datos que vamos a renderizar en la lista
        renderItem={({ item, index }) => (
          // Vista pa cada tarea
          <View
            style={[
              styles.tarea,
              { backgroundColor: coloresTarjetas[index % coloresTarjetas.length] } // Asignamos un color de fondo diferente
            ]}
          >
            {/* Botón pa marcar la tarea como completada */}
            <TouchableOpacity onPress={() => toggleCompletada(item.id)}>
              {/* Icono que cambia según si la tarea está completada o no */}
              <AntDesign
                name={item.completada ? "checkcircle" : "checkcircleo"}
                size={24}
                color="green"
              />
            </TouchableOpacity>

            {/* Texto de la tarea */}
            <Text style={styles.textoTarea}>{item.texto}</Text>

            {/* Icono pa eliminar la tarea */}
            <AntDesign
              name="close"
              size={20}
              color="red"
              onPress={() => eliminarTarea(item.id)}
            />
          </View>
        )}
        keyExtractor={item => item.id} // Usamos el ID único como clave pa cada elemento
      />

      {/* Contadores de tareas */}
      <Text>Total de Tareas: {tareas.length}</Text>
      <Text>Total de Tareas Completadas: {tareas.filter(t => t.completada).length}</Text>
    </View>
  );
}

// Definimos los estilos de la app usando StyleSheet
const styles = StyleSheet.create({
  contenedorPrincipal: {
    flex: 1, // Ocupa todo el espacio disponible en la pantalla
    backgroundColor: '#D3D3D3', // Color de fondo gris claro
    paddingTop: 60, // Espaciado en la parte superior
    paddingHorizontal: 20, // Espaciado horizontal a los lados
  },
  titulo: {
    fontSize: 26, // Tamaño de fuente grande pa el título
    fontWeight: 'bold', // Fuente en negrita
    color: '#4B0082', // Color púrpura pa el título
    textAlign: 'center', // Centrar el texto
    marginBottom: 20, // Espaciado debajo del título
  },
  formulario: {
    flexDirection: 'row', // Disposición horizontal de los elementos dentro del formulario
    marginBottom: 20, // Espaciado debajo del formulario
  },
  input: {
    flex: 1, // Ocupa todo el espacio disponible dentro del formulario
    borderWidth: 1, // Borde de 1 píxel
    borderColor: '#000', // Color negro pa el borde
    padding: 10, // Espaciado interno del campo de texto
    marginRight: 0, // Sin margen a la derecha
    fontSize: 16, // Tamaño de fuente del texto ingresado
    height: 50, // Altura fija del campo de texto
  },
  botonAgregar: {
    paddingVertical: 10, // Espaciado vertical dentro del botón
    paddingHorizontal: 12, // Espaciado horizontal dentro del botón
    backgroundColor: '#32CD32', // Color verde pa el botón
    height: 50, // Altura fija del botón
    justifyContent: 'center', // Centrar el contenido verticalmente
    alignItems: 'center', // Centrar el contenido horizontalmente
    marginLeft: 10, // Espaciado a la izquierda del botón
    borderRadius: 5, // Bordes redondeados del botón
  },
  textoBoton: {
    color: 'white', // Color blanco pa el texto del botón
    fontWeight: 'bold', // Texto en negrita
  },
  tarea: {
    flexDirection: 'row', // Disposición horizontal de los elementos dentro de cada tarea
    alignItems: 'center', // Alinear verticalmente los elementos al centro
    marginBottom: 10, // Espaciado debajo de cada tarea
    padding: 10, // Espaciado interno de cada tarea
    borderRadius: 5, // Bordes redondeados de cada tarea
    shadowColor: '#000', // Color de la sombra
    shadowOffset: { width: 0, height: 2 }, // Desplazamiento de la sombra
    shadowOpacity: 0.5, // Opacidad de la sombra
    shadowRadius: 2, // Radio de la sombra
    elevation: 2, // Elevación pa Android (sombra)
    height: 50, // Altura fija de cada tarea
  },
  textoTarea: {
    fontSize: 16, // Tamaño de fuente del texto de la tarea
    color: 'black', // Color negro pa mejor contraste
    flex: 1, // Ocupa todo el espacio disponible entre los iconos
    marginLeft: 10, // Espaciado a la izquierda del texto
  },
});
