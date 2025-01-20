import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, TextInput, Image, Modal, Button, StatusBar, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Filter, Trash2 } from 'react-native-feather';
import Loader from '../components/Loader';

const InventoryPage = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [error, setError] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showAddItem, setShowAddItem] = useState(false);
    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        category: '',
        availability: 'all'
    });

    const [newItem, setNewItem] = useState({
        name: '',
        price: '',
        category: '',
        description: '',
        imageUrl: '',
        isAvailable: true,
        extras: []
    });

    const getMenuItems = async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { id: 1, name: 'Cheese Burger', price: 5.99, category: 'Burgers', isAvailable: true, description: 'A tasty cheese burger', imageUrl: 'https://www.shutterstock.com/image-photo/burger-tomateoes-lettuce-pickles-on-600nw-2309539129.jpg', ingredients: ['Beef', 'Cheese', 'Lettuce'], allergics: ['Dairy'], nutritionalInfo: { calories: 300, protein: 20, fat: 15, carbohydrates: 30 }, extras: [] },
                    { id: 2, name: 'Veggie Pizza', price: 7.99, category: 'Pizza', isAvailable: false, description: 'A healthy veggie pizza', imageUrl: 'https://cdn.loveandlemons.com/wp-content/uploads/2023/02/vegetarian-pizza.jpg', ingredients: ['Tomato', 'Cheese', 'Bell Pepper'], allergics: ['Dairy'], nutritionalInfo: { calories: 250, protein: 10, fat: 10, carbohydrates: 35 }, extras: [] },
                    { id: 3, name: 'Grilled Chicken', price: 8.49, category: 'Chicken', isAvailable: true, description: 'Juicy grilled chicken', imageUrl: 'https://www.onceuponachef.com/images/2020/05/best-grilled-chicken-scaled.jpg', ingredients: ['Chicken', 'Spices'], allergics: [], nutritionalInfo: { calories: 200, protein: 25, fat: 5, carbohydrates: 0 }, extras: [] },
                    { id: 4, name: 'French Fries', price: 2.99, category: 'Sides', isAvailable: true, description: 'Crispy french fries', imageUrl: 'https://www.inspiredtaste.net/wp-content/uploads/2022/10/Baked-French-Fries-Recipe-1200.jpg', ingredients: ['Potatoes', 'Salt'], allergics: [], nutritionalInfo: { calories: 150, protein: 2, fat: 7, carbohydrates: 20 }, extras: [] },
                ]);
            }, 1000);
        });
    };

    const updateItemAvailability = async (itemId, newStatus) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 500);
        });
    };

    const fetchMenuItems = async () => {
        try {
            setLoading(true);
            setStatusMessage('Loading items...');
            const response = await getMenuItems();
            setMenuItems(response || []);
            setError(null);
            setStatusMessage('');
        } catch (err) {
            setError('Error fetching menu items.');
            setStatusMessage('');
            console.error('Error fetching menu items:', err);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchMenuItems();
        }, [])
    );

    const handleDeleteItem = (itemId) => {
        Alert.alert(
            "Delete Item",
            "Are you sure you want to delete this item?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    onPress: () => {
                        setMenuItems((prevItems) => prevItems.filter(item => item.id !== itemId));
                        setStatusMessage('Item deleted successfully!');
                    },
                    style: "destructive"
                }
            ]
        );
    };

    const toggleItemAvailability = async (itemId, currentStatus) => {
        try {
            await updateItemAvailability(itemId, !currentStatus);
            setMenuItems((prevItems) =>
                prevItems.map((item) =>
                    item.id === itemId ? { ...item, isAvailable: !currentStatus } : item
                )
            );
            setStatusMessage('Item availability updated!');
        } catch (error) {
            console.error('Error updating item availability:', error);
            setStatusMessage('Error updating item availability.');
        }
    };

    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPrice = (!filters.minPrice || item.price >= parseFloat(filters.minPrice)) &&
                           (!filters.maxPrice || item.price <= parseFloat(filters.maxPrice));
        const matchesCategory = !filters.category || item.category.toLowerCase() === filters.category.toLowerCase();
        const matchesAvailability = filters.availability === 'all' ? true :
                                  filters.availability === 'available' ? item.isAvailable :
                                  !item.isAvailable;
        
        return matchesSearch && matchesPrice && matchesCategory && matchesAvailability;
    });

    const handleAddItem = () => {
        // Check for empty fields
        if (!newItem.name.trim() || 
            !newItem.price.trim() || 
            !newItem.category.trim() || 
            !newItem.description.trim() || 
            !newItem.imageUrl.trim()) {
            
            setStatusMessage('Please fill in all fields');
            return;
        }
    
        // Validate price is a valid number
        const parsedPrice = parseFloat(newItem.price);
        if (isNaN(parsedPrice) || parsedPrice <= 0) {
            setStatusMessage('Please enter a valid price');
            return;
        }
    
        const newItemWithId = {
            ...newItem,
            id: menuItems.length + 1,
            price: parsedPrice
        };
    
        setMenuItems(prev => [...prev, newItemWithId]);
        setShowAddItem(false);
        setStatusMessage('New item added successfully!');
        setNewItem({
            name: '',
            price: '',
            category: '',
            description: '',
            imageUrl: '',
            isAvailable: true
        });
    };

    const openItemDetails = (item) => {
        setSelectedItem(item);
    };

    const closeItemDetails = () => {
        setSelectedItem(null);
    };

    const handleEditItem = () => {
        if (selectedItem) {
            setMenuItems((prevItems) =>
                prevItems.map((item) =>
                    item.id === selectedItem.id ? { ...item, ...selectedItem } : item
                )
            );
            setStatusMessage('Item details updated!');
        }
        closeItemDetails();
    };

    const FilterModal = () => (
        <Modal visible={showFilters} animationType="slide" transparent onRequestClose={() => setShowFilters(false)}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
                <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15 }}>Filter Items</Text>
                    
                    <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Price Range</Text>
                    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
                        <TextInput
                            style={{ flex: 1, backgroundColor: '#f0f0f0', padding: 10, borderRadius: 8 }}
                            placeholder="Min Price"
                            value={filters.minPrice}
                            onChangeText={(text) => setFilters(prev => ({ ...prev, minPrice: text }))}
                            keyboardType="numeric"
                        />
                        <TextInput
                            style={{ flex: 1, backgroundColor: '#f0f0f0', padding: 10, borderRadius: 8 }}
                            placeholder="Max Price"
                            value={filters.maxPrice}
                            onChangeText={(text) => setFilters(prev => ({ ...prev, maxPrice: text }))}
                            keyboardType="numeric"
                        />
                    </View>

                    <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Category</Text>
                    <TextInput
                        style={{ backgroundColor: '#f0f0f0', padding: 10, borderRadius: 8, marginBottom: 15 }}
                        placeholder="Category"
                        value={filters.category}
                        onChangeText={(text) => setFilters(prev => ({ ...prev, category: text }))}
                    />

                    <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Availability</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 }}>
                        {['all', 'available', 'outOfStock'].map((option) => (
                            <TouchableOpacity
                                key={option}
                                style={{
                                    padding: 10,
                                    backgroundColor: filters.availability === option ? '#ec7d55' : '#f0f0f0',
                                    borderRadius: 8
                                }}
                                onPress={() => setFilters(prev => ({ ...prev, availability: option }))}
                            >
                                <Text style={{ color: filters.availability === option ? 'white' : 'black' }}>
                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                        <Button title="Clear Filters" onPress={() => setFilters({
                            minPrice: '',
                            maxPrice: '',
                            category: '',
                            availability: 'all'
                        })} />
                        <Button title="Apply Filters" onPress={() => setShowFilters(false)} />
                    </View>
                </View>
            </View>
        </Modal>
    );

    const AddItemModal = () => (
        <Modal visible={showAddItem} animationType="slide" transparent onRequestClose={() => setShowAddItem(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
            <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15 }}>Add New Item</Text>
      
              <TextInput
                style={{ backgroundColor: '#f0f0f0', padding: 10, borderRadius: 8, marginBottom: 10 }}
                placeholder="Title"
                value={newItem.title}
                onChangeText={(text) => setNewItem(prev => ({ ...prev, title: text }))}
              />
      
              <TextInput
                style={{ backgroundColor: '#f0f0f0', padding: 10, borderRadius: 8, marginBottom: 10 }}
                placeholder="Description"
                value={newItem.description}
                onChangeText={(text) => setNewItem(prev => ({ ...prev, description: text }))}
              />
      
              <TextInput
                style={{ backgroundColor: '#f0f0f0', padding: 10, borderRadius: 8, marginBottom: 10 }}
                placeholder="Price"
                value={newItem.price}
                onChangeText={(text) => setNewItem(prev => ({ ...prev, price: parseFloat(text) || '' }))}
                keyboardType="numeric"
              />
      
              <TextInput
                style={{ backgroundColor: '#f0f0f0', padding: 10, borderRadius: 8, marginBottom: 10 }}
                placeholder="Category (appetizer, main, dessert, beverage)"
                value={newItem.category}
                onChangeText={(text) => setNewItem(prev => ({ ...prev, category: text }))}
              />
      
              <TextInput
                style={{ backgroundColor: '#f0f0f0', padding: 10, borderRadius: 8, marginBottom: 10 }}
                placeholder="Ingredients (comma-separated)"
                value={newItem.ingredients}
                onChangeText={(text) => setNewItem(prev => ({ ...prev, ingredients: text.split(',').map(ing => ing.trim()) }))}
              />
      
              <TextInput
                style={{ backgroundColor: '#f0f0f0', padding: 10, borderRadius: 8, marginBottom: 10 }}
                placeholder="Image URL"
                value={newItem.imageUrl}
                onChangeText={(text) => setNewItem(prev => ({ ...prev, imageUrl: text }))}
              />
      
              <TextInput
                style={{ backgroundColor: '#f0f0f0', padding: 10, borderRadius: 8, marginBottom: 10 }}
                placeholder="Allergics (comma-separated)"
                value={newItem.allergics}
                onChangeText={(text) => setNewItem(prev => ({ ...prev, allergics: text.split(',').map(allergic => allergic.trim()) }))}
              />
      
              <TextInput
                style={{ backgroundColor: '#f0f0f0', padding: 10, borderRadius: 8, marginBottom: 10 }}
                placeholder="Currency"
                value={newItem.currency}
                onChangeText={(text) => setNewItem(prev => ({ ...prev, currency: text }))}
              />
      
              <TextInput
                style={{ backgroundColor: '#f0f0f0', padding: 10, borderRadius: 8, marginBottom: 10 }}
                placeholder="Duration (in minutes)"
                value={newItem.duration}
                onChangeText={(text) => setNewItem(prev => ({ ...prev, duration: parseInt(text, 10) || '' }))}
                keyboardType="numeric"
              />
      
              <Text style={{ fontWeight: 'bold', marginVertical: 10 }}>Extras:</Text>
              {newItem.extras.map((extra, index) => (
                <View key={index} style={{ marginBottom: 10 }}>
                  <TextInput
                    style={{ backgroundColor: '#f0f0f0', padding: 10, borderRadius: 8, marginBottom: 5 }}
                    placeholder={`Extra Title (${index + 1})`}
                    value={extra.title}
                    onChangeText={(text) => {
                      const updatedExtras = [...newItem.extras];
                      updatedExtras[index].title = text;
                      setNewItem(prev => ({ ...prev, extras: updatedExtras }));
                    }}
                  />
                  <TextInput
                    style={{ backgroundColor: '#f0f0f0', padding: 10, borderRadius: 8, marginBottom: 5 }}
                    placeholder={`Price (${index + 1})`}
                    value={String(extra.price)}
                    onChangeText={(text) => {
                      const updatedExtras = [...newItem.extras];
                      updatedExtras[index].price = parseFloat(text) || 0;
                      setNewItem(prev => ({ ...prev, extras: updatedExtras }));
                    }}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={{ backgroundColor: '#f0f0f0', padding: 10, borderRadius: 8, marginBottom: 5 }}
                    placeholder={`Amount (${index + 1})`}
                    value={String(extra.amount)}
                    onChangeText={(text) => {
                      const updatedExtras = [...newItem.extras];
                      updatedExtras[index].amount = parseInt(text, 10) || 0;
                      setNewItem(prev => ({ ...prev, extras: updatedExtras }));
                    }}
                    keyboardType="numeric"
                  />
                </View>
              ))}
              <Button title="Add Extra" onPress={() => setNewItem(prev => ({ ...prev, extras: [...prev.extras, { title: '', price: 0, amount: 0 }] }))} />
      
              <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
                <Text>Available: </Text>
                <Switch
                  value={newItem.isAvailable}
                  onValueChange={(value) => setNewItem(prev => ({ ...prev, isAvailable: value }))}
                  trackColor={{ false: '#fff', true: '#ec7d55' }}
                  thumbColor={newItem.isAvailable ? '#fff' : '#ec7d55'}
                />
              </View>
      
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button title="Cancel" onPress={() => setShowAddItem(false)} />
                <Button title="Add Item" onPress={handleAddItem} />
              </View>
            </View>
          </View>
        </Modal>
      );
      

    if (loading) return <Loader size="large" color="#A0A0A0" style={{ marginTop: 20 }} />;
    if (error) return <Text style={{ color: 'red', marginTop: 20 }}>{error}</Text>;

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <StatusBar barStyle="dark-content" backgroundColor="#ec7d55" />

            <View style={{ paddingVertical: 20, backgroundColor: '#ec7d55' }}>
                <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', paddingLeft: 20 }}>
                    Inventory Management
                </Text>
            </View>

            <View style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                    <TextInput
                        style={{ flex: 1, backgroundColor: '#f0f0f0', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ccc' }}
                        placeholder="Search menu items..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <TouchableOpacity
                        style={{ padding: 12, backgroundColor: '#ec7d55', borderRadius: 8 }}
                        onPress={() => setShowFilters(true)}
                    >
                        <Filter stroke="white" width={24} height={24} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={{ backgroundColor: '#ec7d55', padding: 12, borderRadius: 8, alignItems: 'center' }}
                    onPress={() => setShowAddItem(true)}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Add New Item</Text>
                </TouchableOpacity>
            </View>

            {statusMessage && (
                <View style={{ backgroundColor: '#f0f0f0', padding: 10 }}>
                    <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#333' }}>{statusMessage}</Text>
                </View>
            )}

            <ScrollView contentContainerStyle={{ paddingHorizontal: 16 }}>
                {filteredItems.length === 0 ? (
                    <Text style={{ marginTop: 20, textAlign: 'center', fontSize: 18, color: '#888' }}>No items found</Text>
                ) : (
                    filteredItems.map((item) => (
                        <TouchableOpacity
                        key={item.id}
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          padding: 16,
                          backgroundColor: '#f9f9f9',
                          borderRadius: 8,
                          marginBottom: 12,
                          borderWidth: 1,
                          borderColor: '#ddd',
                        }}
                        onPress={() => openItemDetails(item)}
                      >
                        <View style={{ flex: 1 }}>
                          <Image
                            source={{ uri: item.imageUrl }}
                            style={{ width: 180, height: 80, borderRadius: 8, marginBottom: 10 }}
                          />
                          <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{item.title}</Text>
                          <Text style={{ fontSize: 14, color: '#555' }}>${item.price.toFixed(2)}</Text>
                          <Text style={{ fontSize: 14, color: '#555' }}>Duration: {item.duration} mins</Text>
                          <Text style={{ fontSize: 12, color: '#777' }}>Category: {item.category}</Text>
                          <Text style={{ fontSize: 12, color: '#777' }}>Description: {item.description}</Text>
                          <Text style={{ fontSize: 12, color: '#777' }}>Ingredients: {item.ingredients.join(', ')}</Text>
                          {item.allergics.length > 0 && (
                            <Text style={{ fontSize: 12, color: '#777' }}>Allergics: {item.allergics.join(', ')}</Text>
                          )}
                          <Text style={{ fontSize: 12, color: '#777' }}>
                            Nutritional Info: {`Calories: ${item.nutritionalInfo.calories}, Protein: ${item.nutritionalInfo.protein}g, Fat: ${item.nutritionalInfo.fat}g, Carbs: ${item.nutritionalInfo.carbohydrates}g`}
                          </Text>
                          {item.extras.length > 0 && (
                            <View style={{ marginTop: 8 }}>
                              <Text style={{ fontWeight: 'bold', fontSize: 14 }}>Extras:</Text>
                              {item.extras.map((extra, index) => (
                                <View key={index} style={{ marginLeft: 8 }}>
                                  <Text style={{ fontSize: 12, color: '#777' }}>{extra.title}</Text>
                                  <Text style={{ fontSize: 12, color: '#777' }}>
                                    Price: ${extra.price.toFixed(2)}, Amount: {extra.amount}
                                  </Text>
                                  <Text style={{ fontSize: 12, color: '#777' }}>
                                    Nutritional Info: {`Calories: ${extra.nutritionalInfo.calories}, Protein: ${extra.nutritionalInfo.protein}g, Fat: ${extra.nutritionalInfo.fat}g, Carbs: ${extra.nutritionalInfo.carbohydrates}g`}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          )}
                        </View>
                      
                        <View style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                          <Switch
                            value={item.isAvailable}
                            onValueChange={() => toggleItemAvailability(item.id, item.isAvailable)}
                            trackColor={{ false: '#fff', true: '#ec7d55' }}
                            thumbColor={item.isAvailable ? '#fff' : '#ec7d55'}
                          />
                          <Text style={{ fontSize: 12, marginVertical: 4 }}>
                            {item.isAvailable ? 'Available' : 'Out of Stock'}
                          </Text>
                          <TouchableOpacity
                            style={{
                              padding: 8,
                              backgroundColor: '#ff4444',
                              borderRadius: 4,
                              marginTop: 8,
                            }}
                            onPress={() => handleDeleteItem(item.id)}
                          >
                            <Trash2 stroke="white" width={20} height={20} />
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                      
                )))}
            </ScrollView>

            <FilterModal />
            <AddItemModal />

            {selectedItem && (
                <Modal visible={true} animationType="slide" onRequestClose={closeItemDetails}>
                    <View style={{ flex: 1, padding: 20 }}>
                        <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20 }}>Edit Food Item</Text>
                        
                        <TextInput
                            style={{ backgroundColor: '#f0f0f0', padding: 12, borderRadius: 8, marginVertical: 10 }}
                            value={selectedItem.name}
                            onChangeText={(text) => setSelectedItem({ ...selectedItem, name: text })}
                            placeholder="Item Name"
                        />
                        
                        <TextInput
                            style={{ backgroundColor: '#f0f0f0', padding: 12, borderRadius: 8, marginVertical: 10 }}
                            value={selectedItem.price.toString()}
                            onChangeText={(text) => setSelectedItem({ ...selectedItem, price: parseFloat(text) || 0 })}
                            keyboardType="numeric"
                            placeholder="Item Price"
                        />
                        
                        <TextInput
                            style={{ backgroundColor: '#f0f0f0', padding: 12, borderRadius: 8, marginVertical: 10 }}
                            value={selectedItem.description}
                            onChangeText={(text) => setSelectedItem({ ...selectedItem, description: text })}
                            placeholder="Item Description"
                            multiline
                        />
                        
                        <TextInput
                            style={{ backgroundColor: '#f0f0f0', padding: 12, borderRadius: 8, marginVertical: 10 }}
                            value={selectedItem.imageUrl}
                            onChangeText={(text) => setSelectedItem({ ...selectedItem, imageUrl: text })}
                            placeholder="Item Image URL"
                        />

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
                            <Text style={{ marginRight: 10 }}>Available:</Text>
                            <Switch
                                value={selectedItem.isAvailable}
                                onValueChange={(value) => setSelectedItem({ ...selectedItem, isAvailable: value })}
                                trackColor={{ false: '#fff', true: '#ec7d55' }}
                                thumbColor={selectedItem.isAvailable ? '#fff' : '#ec7d55'}
                            />
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                            <TouchableOpacity
                                style={{
                                    padding: 12,
                                    backgroundColor: '#ec7d55',
                                    borderRadius: 8,
                                    flex: 1,
                                    marginRight: 10,
                                    alignItems: 'center'
                                }}
                                onPress={handleEditItem}
                            >
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>Save Changes</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={{
                                    padding: 12,
                                    backgroundColor: '#888',
                                    borderRadius: 8,
                                    flex: 1,
                                    marginLeft: 10,
                                    alignItems: 'center'
                                }}
                                onPress={closeItemDetails}
                            >
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
};

export default InventoryPage;