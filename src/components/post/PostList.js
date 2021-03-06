import React, {Component} from 'react'
import {List, ListItem, Textfield, Button} from 'react-mdl'
import Select from 'react-select'
import {Post} from '../../controllers/Post'

import PostItem from './PostItem'
import {Option, SelectField} from "react-mdl-selectfield";

export default class PostList extends Component {
    constructor(props) {
        super(props);

        let posts = [];
        for (const postKey in props.posts) {
            posts.push(this.createObject(postKey, props.posts[postKey]));
        }

        this.state = {
            posts: posts,
            categories: [],
            locations: [],
            selectedCategory: "",
            selectedMinNumHours: "",
            selectedMaxNumHours: "",
            selectedLocation: "",
            selectedMinPrice: "",
            selectedMaxPrice: "",
            searchKey: "",
            sortKey: "",
            ascendingSort: true
        };

        for (const postKey in posts) {
            console.log(posts[postKey].location);
            this.state.locations.push(posts[postKey].location);
        }

        this.postController = new Post();
    }

    async componentDidMount() {
        let categories
        await this.postController.getCategories().then(data => categories = data)
        categories = Object.keys(categories).map(function (key) {
            return categories[key]
        });
        this.setState({categories})
        console.log(this.state.categories);
    }

    createObject = (key, post) => {
        return {
            key: key,
            price: post.price,
            description: post.description,
            numHours: post.numHours,
            category: post.category,
            location: post.location,
            timeInterval: post.timeInterval,
            title: post.title,
            userId: post.userId,
            type: post.type
        };
    };

    async handleChange() {
        let posts = await this.postController.getAllPosts();

        let key = this.state.searchKey;
        let selectedCategory = this.state.selectedCategory;
        let selectedMinNumHours = parseInt(this.state.selectedMinNumHours);
        let selectedMaxNumHours = parseInt(this.state.selectedMaxNumHours);
        let selectedLocation = this.state.selectedLocation;
        let selectedMinPrice = parseInt(this.state.selectedMinPrice);
        let selectedMaxPrice = parseInt(this.state.selectedMaxPrice);

        let filteredPosts = [];
        for (const postKey in posts) {
            let matchesKey = false;
            let matchesCategory = false;
            let matchesHours = false;
            let matchesLocation = false;
            let matchesPrice = false;

            if (posts[postKey].title.toLowerCase().includes(key.toLowerCase()) ||
                posts[postKey].description.toLowerCase().includes(key.toLowerCase())) {
                matchesKey = true;
            }
            if (posts[postKey].category === selectedCategory || selectedCategory === '') {
                matchesCategory = true;
            }
            if ((posts[postKey].numHours >= selectedMinNumHours || isNaN(selectedMinNumHours))
                && (posts[postKey].numHours <= selectedMaxNumHours || isNaN(selectedMaxNumHours))) {
                matchesHours = true;
            }
            if (posts[postKey].location === selectedLocation || selectedLocation === '') {
                matchesLocation = true;
            }
            if ((posts[postKey].price >= selectedMinPrice || isNaN(selectedMinPrice))
                && (posts[postKey].price <= selectedMaxPrice || isNaN(selectedMaxPrice))) {
                matchesPrice = true;
            }

            if (matchesKey && matchesCategory && matchesHours && matchesLocation && matchesPrice) {
                filteredPosts.push(this.createObject(postKey, posts[postKey]));
            }
        }

        this.setState({posts: filteredPosts})
        this.sort();
    }

    handleSearchChange = (searchKey) => {
        this.setState({searchKey: searchKey.target.value});
        this.handleChange();
    };

    handleCategoryChange = (selectedCategory) => {
        this.setState({selectedCategory: selectedCategory});
        this.handleChange();
    };

    handleMinNumHoursChange = (minNumHours) => {
        this.setState({selectedMinNumHours: minNumHours.target.value});
        this.handleChange();
    };

    handleMaxNumHoursChange = (maxNumHours) => {
        this.setState({selectedMaxNumHours: maxNumHours.target.value});
        this.handleChange();
    };

    handleLocationChange = (selectedLocation) => {
        this.setState({selectedLocation: selectedLocation});
        this.handleChange();
    };

    handleMinPriceChange = (minPrice) => {
        this.setState({selectedMinPrice: minPrice.target.value});
        this.handleChange();
    };

    handleMaxPriceChange = (maxPrice) => {
        this.setState({selectedMaxPrice: maxPrice.target.value});
        this.handleChange();
    };

    handleSortKeyChanged = (sortKey) => {
        this.setState({sortKey});
        this.handleChange();
    };

    handleOrderChanged = (ascendingSort) => {
        this.setState({ascendingSort});
        this.handleChange();

    };

    resetCategory = () => {
        this.setState({selectedCategory: ''})
        this.handleChange();
    };

    resetLocation = () => {
        this.setState({selectedLocation: ''})
        this.handleChange();
    };

    sort = () => {
        if (this.state.sortKey.value === undefined) {
            return;
        }

        let posts = this.state.posts;
        posts.sort((a, b) => {
            if (this.state.sortKey.value === 'price') {
                return parseInt(a.price) - parseInt(b.price);
            }
            return parseInt(a.numHours) - parseInt(b.numHours);
        });

        if (this.state.ascendingSort.value === false) {
            posts.reverse();
        }

        this.setState({posts: posts});
    };

    render() {
        return (
            <div>
                <Textfield
                    onChange={this.handleSearchChange}
                    label="Search"
                    style={{width: '100%'}}
                />
                <div>
                    <SelectField label={'Category'} value={this.state.selectedCategory}
                                 onChange={this.handleCategoryChange}
                                 style={{width: '49%'}}>
                        {this.state.categories.map((cat, idx) => {
                            return <Option value={cat} key={idx} style={{width: '49%'}}>{cat}</Option>
                        })}
                    </SelectField>
                    <Button raised colored onClick={this.resetCategory}>Reset Category</Button>
                </div>
                <div>
                    <Textfield
                        onChange={this.handleMinNumHoursChange}
                        pattern="[0-9]*(\.[0-9]+)?"
                        error="Invalid number of hours!"
                        label="Minimum no. hours/week"
                        value={this.state.selectedMinNumHours}
                    />
                    <Textfield
                        onChange={this.handleMaxNumHoursChange}
                        pattern="[0-9]*(\.[0-9]+)?"
                        error="Invalid number of hours!"
                        label="Maximum no. hours/week"
                        value={this.state.selectedMaxNumHours}
                    />
                </div>
                <div>
                    <SelectField label={'Location'} value={this.state.selectedLocation}
                                 onChange={this.handleLocationChange}
                                 style={{width: '49%'}}>
                        {this.state.locations.map((cat, idx) => {
                            return <Option value={cat} key={idx} style={{width: '49%'}}>{cat}</Option>
                        })}
                    </SelectField>
                    <Button raised colored onClick={this.resetLocation}>Reset Location</Button>
                </div>
                <div>
                    <Textfield
                        onChange={this.handleMinPriceChange}
                        pattern="[0-9]+"
                        error="Invalid price!"
                        label="Minimum price"
                        value={this.state.selectedMinPrice}
                    />
                    <Textfield
                        onChange={this.handleMaxPriceChange}
                        pattern="[0-9]+"
                        error="Invalid price!"
                        label="Maximum price"
                        value={this.state.selectedMaxPrice}
                    />
                </div>
                <div style={{width: 200}}>
                    <br/>
                    <p>
                        Sort by:
                    </p>
                    <Select
                        clearable={false}
                        name="sort-key"
                        value={this.state.sortKey.value}
                        onChange={this.handleSortKeyChanged}
                        options={[
                            {value: 'price', label: 'Price'},
                            {value: 'hours', label: 'Num. hours'},
                        ]}
                    />
                    <Select
                        style={{marginTop: 5, marginBottom: 5}}
                        clearable={false}
                        name="order-select"
                        value={this.state.ascendingSort.value}
                        onChange={this.handleOrderChanged}
                        options={[
                            {value: true, label: 'Ascending'},
                            {value: false, label: 'Descending'},
                        ]}
                    />
                </div>
                <List>
                    {this.state.posts
                        ? this.state.posts.map(post => {
                            return (
                                <ListItem key={post.key}>
                                    <PostItem id={post.key} post={post} {...this.props}/>
                                </ListItem>)
                        })
                        : <h3>No posts yet</h3>
                    }

                </List>
            </div>
        )
    }
}
